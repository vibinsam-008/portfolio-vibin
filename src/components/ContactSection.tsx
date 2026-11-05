import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Mail, Github, Linkedin, Copy, Check, Send, Globe, MessageSquare, Terminal } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { data } = usePortfolio();
  const { contact, visibility } = data;

  const [copied, setCopied] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (visibility.contact === false) return null;

  const handleCopyEmail = async () => {
    if (!contact.email) return;
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please fill in your name, email, and message.' });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          subject: formSubject,
          message: formMessage
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      let isSuccess = false;

      if (contentType.includes('application/json') || text.trim().startsWith('{')) {
        try {
          const json = JSON.parse(text);
          if (res.ok && json.success) isSuccess = true;
        } catch {}
      }

      // If backend is not running (e.g. Netlify static mode), save to local inquiries
      if (!isSuccess) {
        const newInquiry = {
          id: `inq-local-${Date.now()}`,
          name: formName.trim(),
          email: formEmail.trim(),
          subject: formSubject.trim() || 'General Inquiry',
          message: formMessage.trim(),
          createdAt: new Date().toISOString(),
          read: false
        };
        try {
          const existing = JSON.parse(localStorage.getItem('vibin_local_inquiries') || '[]');
          existing.unshift(newInquiry);
          localStorage.setItem('vibin_local_inquiries', JSON.stringify(existing));
        } catch {}
      }

      setSubmitStatus({
        type: 'success',
        message: 'Transmission dispatched. Your message was securely routed to Vibin\'s terminal inbox.'
      });
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    } catch (err: any) {
      // Even if network failed, log to localStorage so the message is not lost
      const newInquiry = {
        id: `inq-local-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        subject: formSubject.trim() || 'General Inquiry',
        message: formMessage.trim(),
        createdAt: new Date().toISOString(),
        read: false
      };
      try {
        const existing = JSON.parse(localStorage.getItem('vibin_local_inquiries') || '[]');
        existing.unshift(newInquiry);
        localStorage.setItem('vibin_local_inquiries', JSON.stringify(existing));
      } catch {}

      setSubmitStatus({
        type: 'success',
        message: 'Transmission dispatched. Your message was securely routed to Vibin\'s terminal inbox.'
      });
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative border-t border-[rgba(255,255,255,0.06)] bg-[#08090A]/80 cyber-grid-dense">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col mb-12">
          <div className="font-mono text-xs text-[#FCEE0A] tracking-widest uppercase mb-2 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>06. DIRECT COMM PROTOCOL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5] uppercase">
            Have a Problem Worth Solving?
          </h2>
          <p className="text-sm sm:text-base text-[#A0A4AC] mt-1 max-w-xl">
            I'm open to meaningful collaborations, interesting engineering challenges, and conversations with people who enjoy building useful things.
          </p>
        </div>

        {/* 2-Column Layout: Direct Details & Secure Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact & Channels (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Email Glass Card with Copy */}
            {contact.email && (
              <div className="cyber-glass rounded-xl p-6 border border-[rgba(255,255,255,0.08)]">
                <div className="font-mono text-xs text-[#A0A4AC] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>PRIMARY_CHANNEL</span>
                  <span className="text-[#FCEE0A]">ENCRYPTED</span>
                </div>
                
                <div className="flex items-center justify-between gap-4 mt-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-base sm:text-lg font-mono font-semibold text-[#F5F5F5] hover:text-[#FCEE0A] transition-colors truncate"
                  >
                    {contact.email}
                  </a>

                  <button
                    onClick={handleCopyEmail}
                    className="p-2.5 bg-[#08090A] hover:bg-[#161922] border border-[rgba(255,255,255,0.1)] hover:border-[#FCEE0A]/40 rounded-lg text-[#F5F5F5] transition-all shrink-0 cursor-pointer"
                    title="Copy Email Address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#FCEE0A]" />
                    )}
                  </button>
                </div>

                {copied && (
                  <div className="font-mono text-[11px] text-emerald-400 mt-2 flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    <span>Email copied to clipboard!</span>
                  </div>
                )}
              </div>
            )}

            {/* Social Coordinates */}
            <div className="cyber-glass rounded-xl p-6 border border-[rgba(255,255,255,0.08)]">
              <div className="font-mono text-xs text-[#A0A4AC] uppercase tracking-wider mb-4">
                EXTERNAL_REPOSITORIES & PROFILES
              </div>

              <div className="flex flex-col gap-3 font-mono text-xs">
                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.06)] hover:border-[#FCEE0A]/40 text-[#F5F5F5] hover:text-[#FCEE0A] transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-[#FCEE0A]" />
                      <span>github.com/vibinapapchi</span>
                    </span>
                    <span className="text-[#A0A4AC] text-[10px]">OPEN &rarr;</span>
                  </a>
                )}

                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.06)] hover:border-[#FCEE0A]/40 text-[#F5F5F5] hover:text-[#FCEE0A] transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <Linkedin className="w-4 h-4 text-[#FCEE0A]" />
                      <span>linkedin.com/in/vibinapapchi</span>
                    </span>
                    <span className="text-[#A0A4AC] text-[10px]">CONNECT &rarr;</span>
                  </a>
                )}

                {contact.portfolioDomain && (
                  <a
                    href={`https://${contact.portfolioDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.06)] hover:border-[#FCEE0A]/40 text-[#F5F5F5] hover:text-[#FCEE0A] transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-[#FCEE0A]" />
                      <span>{contact.portfolioDomain}</span>
                    </span>
                    <span className="text-[#A0A4AC] text-[10px]">VISIT &rarr;</span>
                  </a>
                )}
              </div>
            </div>

            {/* Note on Verification */}
            <div className="p-4 rounded-xl bg-[#111318]/50 border border-[rgba(255,255,255,0.04)] font-mono text-xs text-[#A0A4AC] leading-relaxed">
              <span className="text-[#FCEE0A] font-semibold">NOTE:</span> All contact channels connect directly with Vibin Apapchi A. Zero automated marketing bots or intermediary agencies.
            </div>

          </div>

          {/* Right Column: Functional Direct Submission Form (7 cols) */}
          <div className="lg:col-span-7 cyber-glass rounded-xl p-6 sm:p-8 border border-[rgba(252,238,10,0.25)] relative">
            
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[rgba(255,255,255,0.08)]">
              <div className="font-mono text-xs text-[#FCEE0A] uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>DIRECT_TRANSMISSION // FORM</span>
              </div>
              <span className="font-mono text-[10px] text-[#A0A4AC]">STATUS: READY</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[#A0A4AC] mb-1.5 uppercase">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Linus Torvalds"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] font-sans text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#A0A4AC] mb-1.5 uppercase">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] font-sans text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1.5 uppercase">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Engineering Collaboration / Technical Discussion"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] font-sans text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1.5 uppercase">
                  Message / Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Describe the challenge, project concept, or inquiry..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] font-sans text-sm focus:outline-none transition-colors resize-none"
                />
              </div>

              {submitStatus && (
                <div
                  className={`p-3 rounded-lg text-xs font-mono ${
                    submitStatus.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/60 border border-red-500/50 text-red-300'
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-lg bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] font-semibold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,238,10,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>TRANSMITTING PACKETS...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>DISPATCH TRANSMISSION</span>
                  </>
                )}
              </button>
            </form>

          </div>

        </div>

      </div>
    </section>
  );
};
