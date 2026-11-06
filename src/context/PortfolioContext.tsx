import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortfolioData, ContactInquiry } from '../types/portfolio.ts';
import { initialPortfolioData } from '../data/defaultPortfolio.ts';
import { 
  fetchFromSupabase, 
  saveToSupabase, 
  isSupabaseConfigured, 
  getSupabaseCredentials,
  SUPABASE_SQL_SETUP 
} from '../lib/supabase.ts';

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
  isSupabaseActive: boolean;
  supabaseConfig: { url: string; key: string } | null;
  configureSupabase: (url: string, key: string) => Promise<{ success: boolean; error?: string }>;
  disconnectSupabase: () => void;
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateDraft: (updater: (prev: PortfolioData) => PortfolioData) => void;
  saveAndPublish: (dataToSave?: PortfolioData) => Promise<{ success: boolean; mode?: 'cloud' | 'server' | 'local'; message?: string; error?: string }>;
  discardDraft: () => void;
  uploadImage: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  reloadPortfolio: () => Promise<void>;
  reloadInquiries: () => Promise<void>;
  toggleInquiryRead: (id: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  setupAdminAccount: (password: string, email: string) => Promise<{ success: boolean; error?: string }>;
  exportJson: () => string;
  exportCodeFile: () => string;
  importJson: (jsonStr: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Safe response parser that guards against HTML (<!DOCTYPE) returned by static hosts like Netlify
async function parseResponseSafe(res: Response): Promise<{ isJson: boolean; data: any; rawText: string }> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  const trimmed = text.trim();
  if (contentType.includes('application/json') || (trimmed.startsWith('{') || trimmed.startsWith('['))) {
    try {
      const data = JSON.parse(text);
      return { isJson: true, data, rawText: text };
    } catch {
      return { isJson: false, data: null, rawText: text };
    }
  }
  return { isJson: false, data: null, rawText: text };
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseConfig, setSupabaseConfig] = useState<{ url: string; key: string } | null>(getSupabaseCredentials);
  const isSupabaseActive = Boolean(supabaseConfig);

  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const cached = localStorage.getItem('vibin_portfolio_data');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Could not read cached portfolio:', e);
    }
    return initialPortfolioData;
  });

  const [draftData, setDraftData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('vibin_admin_token'));
  const [adminEmail, setAdminEmail] = useState<string | null>(() => localStorage.getItem('vibin_admin_email') || 'vibinappachi@gmail.com');
  const [isStaticHost, setIsStaticHost] = useState(false);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const local = localStorage.getItem('vibin_local_inquiries');
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  });

  const isAdmin = Boolean(adminToken);
  const isDraftMode = Boolean(draftData);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);

      // 1. If Supabase cloud database is connected, fetch global data (works across all devices!)
      if (isSupabaseConfigured()) {
        const supaData = await fetchFromSupabase();
        if (supaData && supaData.identity) {
          setData(supaData);
          localStorage.setItem('vibin_portfolio_data', JSON.stringify(supaData));
          setIsStaticHost(false);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // 2. Otherwise try Express server
      const res = await fetch('/api/portfolio');
      const { isJson, data: serverData } = await parseResponseSafe(res);

      if (res.ok && isJson && serverData && serverData.identity) {
        setData(serverData);
        setIsStaticHost(false);
        localStorage.setItem('vibin_portfolio_data', JSON.stringify(serverData));
        setError(null);
      } else {
        // We are on Netlify / static host (which returns index.html or 404 for /api/portfolio)
        setIsStaticHost(true);
        const cached = localStorage.getItem('vibin_portfolio_data');
        if (cached) {
          setData(JSON.parse(cached));
        } else {
          setData(initialPortfolioData);
        }
      }
    } catch (err: any) {
      console.warn('Network fetch failed, activating static mode:', err.message);
      setIsStaticHost(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    // Read local inquiries first
    let localList: ContactInquiry[] = [];
    try {
      const local = localStorage.getItem('vibin_local_inquiries');
      if (local) localList = JSON.parse(local);
    } catch {}

    if (!adminToken) {
      setInquiries(localList);
      return;
    }

    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const { isJson, data: serverList } = await parseResponseSafe(res);
      if (res.ok && isJson && Array.isArray(serverList)) {
        // Merge without duplicates
        const map = new Map<string, ContactInquiry>();
        serverList.forEach((item: ContactInquiry) => map.set(item.id, item));
        localList.forEach((item: ContactInquiry) => map.set(item.id, item));
        setInquiries(Array.from(map.values()));
        setIsStaticHost(false);
      } else {
        setIsStaticHost(true);
        setInquiries(localList);
      }
    } catch {
      setIsStaticHost(true);
      setInquiries(localList);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchInquiries();
    }
  }, [adminToken]);

  const login = async (password: string, email: string = 'vibinappachi@gmail.com') => {
    try {
      // 1. Try server endpoint first
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const { isJson, data: json } = await parseResponseSafe(res);

      if (res.ok && isJson && json?.success && json.token) {
        setAdminToken(json.token);
        setAdminEmail(json.user?.email || email);
        localStorage.setItem('vibin_admin_token', json.token);
        localStorage.setItem('vibin_admin_email', json.user?.email || email);
        setIsStaticHost(false);
        return { success: true };
      }

      // 2. If the server returned HTML (i.e. Netlify static rewrite), or failed:
      // Fallback to static client authentication using default or custom password!
      const customPass = localStorage.getItem('vibin_custom_admin_password');
      const expectedPass = customPass || 'vibin2030';

      if (password === expectedPass) {
        const clientToken = `vibin-static-token-${Date.now()}`;
        setAdminToken(clientToken);
        setAdminEmail(email);
        setIsStaticHost(true);
        localStorage.setItem('vibin_admin_token', clientToken);
        localStorage.setItem('vibin_admin_email', email);
        return { success: true };
      }

      if (isJson && json?.error) {
        return { success: false, error: json.error };
      }

      return { success: false, error: 'Invalid password. (Default is vibin2030)' };
    } catch (err: any) {
      // Fallback for offline / static host
      const customPass = localStorage.getItem('vibin_custom_admin_password');
      const expectedPass = customPass || 'vibin2030';
      if (password === expectedPass) {
        const clientToken = `vibin-static-token-${Date.now()}`;
        setAdminToken(clientToken);
        setAdminEmail(email);
        setIsStaticHost(true);
        localStorage.setItem('vibin_admin_token', clientToken);
        localStorage.setItem('vibin_admin_email', email);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed. Please verify password.' };
    }
  };

  const setupAdminAccount = async (password: string, email: string) => {
    // Save to local storage for static mode
    localStorage.setItem('vibin_custom_admin_password', password);
    localStorage.setItem('vibin_admin_email', email);
    setAdminEmail(email);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ email, password })
      });
      const { isJson, data: json } = await parseResponseSafe(res);
      if (res.ok && isJson && json?.success && json.token) {
        setAdminToken(json.token);
        localStorage.setItem('vibin_admin_token', json.token);
      }
    } catch {
      // Static mode continues gracefully
    }
    return { success: true };
  };

  const logout = () => {
    setAdminToken(null);
    setDraftData(null);
    localStorage.removeItem('vibin_admin_token');
  };

  const updateDraft = (updater: (prev: PortfolioData) => PortfolioData) => {
    setDraftData((prev) => {
      const base = prev || data;
      return updater(base);
    });
  };

  const discardDraft = () => {
    setDraftData(null);
  };

  const saveAndPublish = async (dataToSave?: PortfolioData): Promise<{ success: boolean; mode?: 'cloud' | 'server' | 'local'; message?: string; error?: string }> => {
    if (!adminToken) {
      return { success: false, error: 'Unauthorized: Admin session required' };
    }
    const target = dataToSave || draftData || data;
    target.updatedAt = new Date().toISOString();

    // 1. Always update local state & cache
    localStorage.setItem('vibin_portfolio_data', JSON.stringify(target));
    setData(target);
    setDraftData(null);

    // 2. If Supabase cloud database is connected, sync to cloud (persists across ALL devices anywhere!)
    if (isSupabaseConfigured()) {
      const supaRes = await saveToSupabase(target);
      if (supaRes.success) {
        return { 
          success: true, 
          mode: 'cloud', 
          message: 'Published to Supabase Cloud Database! Synced live across all devices.' 
        };
      } else {
        console.error('Supabase cloud sync error:', supaRes.error);
        return { 
          success: false, 
          error: `Supabase cloud sync failed: ${supaRes.error || 'Check SQL table & credentials in Cloud Database tab.'}` 
        };
      }
    }

    // 3. Try persisting to backend API if active (Node/Express)
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/admin/portfolio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(target)
      });
      const { isJson, data: json } = await parseResponseSafe(res);
      if (res.ok && isJson && json?.success) {
        setIsStaticHost(false);
        return { 
          success: true, 
          mode: 'server', 
          message: 'Saved to full-stack server database!' 
        };
      }
    } catch {
      // Backend not running (Netlify static)
    }

    // 4. Running static with no shared database connected
    return { 
      success: true, 
      mode: 'local', 
      message: 'Saved locally in this browser. To make this visible on your phone and other devices, connect Supabase in Cloud Database tab or click Download Code!' 
    };
  };

  const uploadImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!adminToken) {
      return { success: false, error: 'Admin session required' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          // If backend server is running, try sending to server
          if (!isStaticHost) {
            try {
              const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                  filename: file.name,
                  contentType: file.type,
                  base64Data
                })
              });
              const { isJson, data: json } = await parseResponseSafe(res);
              if (res.ok && isJson && json?.success && json.url) {
                resolve({ success: true, url: json.url });
                return;
              }
            } catch {
              // fallback to dataURL
            }
          }

          // In Static / Netlify mode, Base64 DataURL works natively!
          resolve({ success: true, url: base64Data });
        } catch (err: any) {
          resolve({ success: false, error: err.message });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
      reader.readAsDataURL(file);
    });
  };

  const toggleInquiryRead = async (id: string) => {
    setInquiries(prev => {
      const updated = prev.map(inq => inq.id === id ? { ...inq, read: !inq.read } : inq);
      localStorage.setItem('vibin_local_inquiries', JSON.stringify(updated));
      return updated;
    });

    if (adminToken && !isStaticHost) {
      try {
        await fetch(`/api/admin/inquiries/${id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      } catch {}
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries(prev => {
      const updated = prev.filter(inq => inq.id !== id);
      localStorage.setItem('vibin_local_inquiries', JSON.stringify(updated));
      return updated;
    });

    if (adminToken && !isStaticHost) {
      try {
        await fetch(`/api/admin/inquiries/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      } catch {}
    }
  };

  const configureSupabase = async (url: string, key: string) => {
    localStorage.setItem('vibin_supabase_url', url.trim());
    localStorage.setItem('vibin_supabase_key', key.trim());
    setSupabaseConfig({ url: url.trim(), key: key.trim() });
    // Attempt saving current portfolio data to Supabase
    const res = await saveToSupabase(data);
    return res;
  };

  const disconnectSupabase = () => {
    localStorage.removeItem('vibin_supabase_url');
    localStorage.removeItem('vibin_supabase_key');
    setSupabaseConfig(null);
  };

  const exportCodeFile = () => {
    return `import { PortfolioData } from '../types/portfolio.ts';\n\nexport const initialPortfolioData: PortfolioData = ${JSON.stringify(data, null, 2)};\n`;
  };

  const exportJson = () => {
    return JSON.stringify(data, null, 2);
  };

  const importJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.identity && parsed.projects) {
        setData(parsed);
        localStorage.setItem('vibin_portfolio_data', JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Provide active data (draft takes priority if in preview mode)
  const activeData = draftData || data;

  return (
    <PortfolioContext.Provider
      value={{
        data: activeData,
        loading,
        error,
        isAdmin,
        adminToken,
        adminEmail,
        isDraftMode,
        draftData,
        inquiries,
        isStaticHost,
        isSupabaseActive,
        supabaseConfig,
        configureSupabase,
        disconnectSupabase,
        login,
        logout,
        updateDraft,
        saveAndPublish,
        discardDraft,
        uploadImage,
        reloadPortfolio: fetchPortfolio,
        reloadInquiries: fetchInquiries,
        toggleInquiryRead,
        deleteInquiry,
        setupAdminAccount,
        exportJson,
        exportCodeFile,
        importJson
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
