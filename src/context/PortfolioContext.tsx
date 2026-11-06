import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortfolioData, ContactInquiry } from '../types/portfolio.ts';
import { login as identityLogin, logout as identityLogout, getUser, updateUser, handleAuthCallback, onAuthChange } from '@netlify/identity';
import { initialPortfolioData } from '../data/defaultPortfolio.ts';

interface PortfolioContextType {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  adminToken: string | null;
  adminEmail: string | null;
  isDraftMode: boolean;
  draftData: PortfolioData | null;
  inquiries: ContactInquiry[];
  isStaticHost: boolean;
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateDraft: (updater: (prev: PortfolioData) => PortfolioData) => void;
  saveAndPublish: (dataToSave?: PortfolioData) => Promise<{ success: boolean; error?: string }>;
  discardDraft: () => void;
  uploadImage: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  reloadPortfolio: () => Promise<void>;
  reloadInquiries: () => Promise<void>;
  toggleInquiryRead: (id: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  setupAdminAccount: (password: string, email: string) => Promise<{ success: boolean; error?: string }>;
  exportJson: () => string;
  importJson: (jsonStr: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(path, { ...options, cache: 'no-store' });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) throw new Error(json?.error || 'Shared storage is unavailable. Please retry.');
  return json;
}
function isAuthorized(user: Awaited<ReturnType<typeof getUser>>) {
  return Boolean(user?.confirmedAt && (user.email?.toLowerCase() === 'vibinappachi@gmail.com' || user.roles?.includes('admin')));
}
function readLegacyDraft(): PortfolioData | null {
  try { return JSON.parse(localStorage.getItem('vibin_portfolio_data') || 'null'); } catch { return null; }
}
export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(initialPortfolioData);
  const [draftData, setDraftData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const fetchPortfolio = async () => {
    try {
      const published = await request('/api/portfolio');
      if (!published.identity) throw new Error('Invalid server response.');
      setData(published);
      setError(null);
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };
  const fetchInquiries = async () => {
    try { setInquiries(await request('/api/admin/inquiries')); }
    catch (err) { setError((err as Error).message); }
  };
  useEffect(() => {
    void fetchPortfolio();
    const refresh = () => { if (document.visibilityState === 'visible') void fetchPortfolio(); };
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  useEffect(() => {
    const sync = async () => {
      const user = await getUser();
      setIsAdmin(isAuthorized(user));
      setAdminEmail(user?.email || null);
    };
    void handleAuthCallback().then(sync).catch(err => setError(err.message));
    const unsubscribe = onAuthChange(() => { void sync(); });
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (isAdmin) {
      void fetchInquiries();
      // Recover old device-only edits as an explicit draft, never as published content.
      const legacy = readLegacyDraft();
      if (legacy?.identity && Array.isArray(legacy.projects)) setDraftData(legacy);
    } else setInquiries([]);
  }, [isAdmin]);

  const login = async (password: string, email = 'vibinappachi@gmail.com') => {
    try {
      const user = await identityLogin(email, password);
      if (!isAuthorized(user)) { await identityLogout(); throw new Error('Administrator access required.'); }
      setIsAdmin(true); setAdminEmail(user.email || null);
      return { success: true };
    } catch (err) { return { success: false, error: (err as Error).message }; }
  };
  const logout = () => { void identityLogout(); setIsAdmin(false); setDraftData(null); };
  const setupAdminAccount = async (password: string, email: string) => {
    try {
      if (email.toLowerCase() !== adminEmail?.toLowerCase()) throw new Error('Keep the authorized administrator email unchanged.');
      await updateUser({ password });
      return { success: true };
    } catch (err) { return { success: false, error: (err as Error).message }; }
  };
  const updateDraft = (updater: (prev: PortfolioData) => PortfolioData) => setDraftData(prev => updater(prev || data));
  const discardDraft = () => { setDraftData(null); localStorage.removeItem('vibin_portfolio_data'); };
  const saveAndPublish = async (dataToSave?: PortfolioData) => {
    if (!isAdmin) return { success: false, error: 'Please sign in as administrator.' };
    try {
      const result = await request('/api/admin/portfolio', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave || draftData || data),
      });
      if (!result.success) throw new Error('Publishing failed. Your draft is still available.');
      setData(result.data); setDraftData(null); setError(null);
      localStorage.removeItem('vibin_portfolio_data');
      return { success: true };
    } catch (err) { return { success: false, error: (err as Error).message }; }
  };
  const uploadImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Please sign in.' };
    if (file.size > 4 * 1024 * 1024) return { success: false, error: 'Image must be smaller than 4MB.' };
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
      });
      return await request('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64Data }) });
    } catch (err) { return { success: false, error: (err as Error).message }; }
  };
  const changeInquiry = async (id: string, method: string, suffix = '') => {
    try { await request(`/api/admin/inquiries/${encodeURIComponent(id)}${suffix}`, { method }); await fetchInquiries(); }
    catch (err) { setError((err as Error).message); }
  };
  const importJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.identity || !Array.isArray(parsed.projects)) return false;
      setDraftData(parsed); return true;
    } catch { return false; }
  };
  return <PortfolioContext.Provider value={{
    data: draftData || data, loading, error, isAdmin, adminToken: null, adminEmail,
    isDraftMode: Boolean(draftData), draftData, inquiries, isStaticHost: Boolean(error),
    login, logout, updateDraft, saveAndPublish, discardDraft, uploadImage,
    reloadPortfolio: fetchPortfolio, reloadInquiries: fetchInquiries,
    toggleInquiryRead: id => changeInquiry(id, 'PUT', '/read'),
    deleteInquiry: id => changeInquiry(id, 'DELETE'), setupAdminAccount,
    exportJson: () => JSON.stringify(draftData || data, null, 2), importJson,
  }}>{children}</PortfolioContext.Provider>;
};
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
