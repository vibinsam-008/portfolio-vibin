import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortfolioData, ContactInquiry } from '../types/portfolio.ts';
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
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(initialPortfolioData);
  const [draftData, setDraftData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('vibin_admin_token'));
  const [adminEmail, setAdminEmail] = useState<string | null>(() => localStorage.getItem('vibin_admin_email'));
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const isAdmin = Boolean(adminToken);
  const isDraftMode = Boolean(draftData);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error('Failed to fetch portfolio data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.warn('Could not load portfolio from server, using local fallback:', err.message);
      // Fallback is already initialPortfolioData
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        setInquiries(json);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Login failed' };
      }
      setAdminToken(json.token);
      setAdminEmail(json.user?.email || email);
      localStorage.setItem('vibin_admin_token', json.token);
      localStorage.setItem('vibin_admin_email', json.user?.email || email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const setupAdminAccount = async (password: string, email: string) => {
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Setup failed' };
      }
      if (json.token) {
        setAdminToken(json.token);
        setAdminEmail(json.user?.email || email);
        localStorage.setItem('vibin_admin_token', json.token);
        localStorage.setItem('vibin_admin_email', json.user?.email || email);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setAdminToken(null);
    setAdminEmail(null);
    setDraftData(null);
    localStorage.removeItem('vibin_admin_token');
    localStorage.removeItem('vibin_admin_email');
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

  const saveAndPublish = async (dataToSave?: PortfolioData) => {
    if (!adminToken) {
      return { success: false, error: 'Unauthorized: Admin session required' };
    }
    const target = dataToSave || draftData || data;
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(target)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to save portfolio' };
      }
      setData(json.data);
      setDraftData(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
          const json = await res.json();
          if (!res.ok || !json.success) {
            resolve({ success: false, error: json.error || 'Upload failed' });
          } else {
            resolve({ success: true, url: json.url });
          }
        } catch (err: any) {
          resolve({ success: false, error: err.message });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
      reader.readAsDataURL(file);
    });
  };

  const toggleInquiryRead = async (id: string) => {
    if (!adminToken) return;
    try {
      await fetch(`/api/admin/inquiries/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, read: !inq.read } : inq));
    } catch (err) {
      console.error('Error toggling inquiry read status:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!adminToken) return;
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setInquiries(prev => prev.filter(inq => inq.id !== id));
    } catch (err) {
      console.error('Error deleting inquiry:', err);
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
        setupAdminAccount
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
