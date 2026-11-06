import type { Config } from '@netlify/functions';
import { getUser } from '@netlify/identity';
import { getStore } from '@netlify/blobs';
import { eq, desc, not } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '../../db/index.js';
import { portfolios, inquiries } from '../../db/schema.js';
import { initialPortfolioData } from '../../src/data/defaultPortfolio.js';

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
async function storeImage(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(dataUrl);
  if (!match) throw new Error('Use a PNG, JPG, WEBP, or GIF image.');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 4 * 1024 * 1024) throw new Error('Image must be smaller than 4MB.');
  const ext = match[1].split('/')[1];
  const key = `${randomUUID()}.${ext}`;
  await getStore({ name: 'portfolio-images', consistency: 'strong' }).set(key, new Blob([bytes], { type: match[1] }));
  return `/api/images/${key}`;
}
export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  try {
    if (path.startsWith('/api/images/') && req.method === 'GET') {
      const key = path.slice('/api/images/'.length);
      if (!/^[a-f0-9-]+\.(png|jpeg|webp|gif)$/.test(key)) return json({ error: 'Not found' }, 404);
      const bytes = await getStore({ name: 'portfolio-images', consistency: 'strong' }).get(key, { type: 'arrayBuffer' });
      if (!bytes) return json({ error: 'Not found' }, 404);
      return new Response(bytes, { headers: { 'Content-Type': `image/${key.split('.').pop()}`, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (path === '/api/portfolio' && req.method === 'GET') {
      const [row] = await getDb().select().from(portfolios).where(eq(portfolios.id, 'published'));
      return json(row?.content ?? initialPortfolioData);
    }
    if (path === '/api/contact' && req.method === 'POST') {
      const body = await req.json();
      if (![body.name, body.email, body.message].every(v => typeof v === 'string' && v.trim() && v.length < 10000) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return json({ error: 'Enter a valid name, email and message.' }, 400);
      await getDb().insert(inquiries).values({ id: randomUUID(), name: body.name.trim(), email: body.email.trim(), subject: String(body.subject || 'General Inquiry').slice(0, 200), message: body.message.trim() });
      return json({ success: true });
    }
    if (!path.startsWith('/api/admin/')) return json({ error: 'Not found' }, 404);
    const user = await getUser();
    if (!user) return json({ error: 'Please sign in again.' }, 401);
    if (!user.confirmedAt || (user.email?.toLowerCase() !== 'vibinappachi@gmail.com' && !user.roles?.includes('admin'))) return json({ error: 'Administrator access required.' }, 403);
    const db = getDb();
    if (path === '/api/admin/portfolio' && req.method === 'PUT') {
      if (Number(req.headers.get('content-length')) > 5_500_000) return json({ error: 'Portfolio is too large.' }, 413);
      const content = await req.json();
      if (!content?.identity || typeof content.identity.name !== 'string' || !['projects', 'techStack', 'learningTracks', 'principles'].every(k => Array.isArray(content[k])) || !content.contact || !content.visibility) return json({ error: 'Invalid portfolio data.' }, 400);
      for (const project of content.projects) {
        if (project.coverImage?.startsWith('data:')) project.coverImage = await storeImage(project.coverImage);
      }
      content.updatedAt = new Date().toISOString();
      await db.insert(portfolios).values({ id: 'published', content }).onConflictDoUpdate({ target: portfolios.id, set: { content, updatedAt: new Date() } });
      return json({ success: true, data: content });
    }
    if (path === '/api/admin/upload' && req.method === 'POST') {
      const body = await req.json();
      try { return json({ success: true, url: await storeImage(body.base64Data) }); }
      catch { return json({ error: 'Upload a PNG, JPG, WEBP, or GIF smaller than 4MB.' }, 400); }
    }
    if (path === '/api/admin/inquiries' && req.method === 'GET') return json(await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)));
    const match = /^\/api\/admin\/inquiries\/([^/]+)(\/read)?$/.exec(path);
    if (match && req.method === 'PUT' && match[2]) {
      await db.update(inquiries).set({ read: not(inquiries.read) }).where(eq(inquiries.id, match[1]));
      return json({ success: true });
    }
    if (match && req.method === 'DELETE' && !match[2]) {
      await db.delete(inquiries).where(eq(inquiries.id, match[1]));
      return json({ success: true });
    }
    return json({ error: 'Not found' }, 404);
  } catch {
    return json({ error: 'The server could not save or load data. Please retry.' }, 503);
  }
};
export const config: Config = { path: '/api/*' };
