
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Article, EPaperPage, Clipping, User, UserRole, Advertisement, WatermarkSettings, RecoveryRequest, ProfileUpdateRequest, EmailSettings, SubscriptionSettings, AdSettings, AnalyticsData, Comment, ContactMessage, Classified, SecurityRequest } from '../types';
import { CHIEF_EDITOR_ID, DEFAULT_EMAIL_SETTINGS, DEFAULT_SUBSCRIPTION_SETTINGS, DEFAULT_AD_SETTINGS, INITIAL_ARTICLES, INITIAL_USERS, INITIAL_EPAPER_PAGES, INITIAL_ADS, INITIAL_CLASSIFIEDS } from '../constants';
import { supabase } from '../lib/supabase';

interface NewsContextType {
  articles: Article[];
  categories: string[];
  ePaperPages: EPaperPage[];
  clippings: Clipping[];
  currentUser: User | null;
  users: User[];
  advertisements: Advertisement[];
  watermarkSettings: WatermarkSettings;
  recoveryRequests: RecoveryRequest[];
  emailSettings: EmailSettings;
  subscriptionSettings: SubscriptionSettings;
  adSettings: AdSettings;
  comments: Comment[];
  contactMessages: ContactMessage[];
  classifieds: Classified[];
  showAds: boolean;
  currentDeviceId: string;
  securityRequests: SecurityRequest[];
  
  login: (email: string, password: string, role?: UserRole) => Promise<User | null>;
  // New: Request Access for new device
  requestAccess: (email: string, password: string, type: 'login' | 'recovery') => Promise<{ success: boolean; message: string; requestId?: string }>;
  checkRequestStatus: (requestId: string) => Promise<SecurityRequest['status']>;
  respondToSecurityRequest: (requestId: string, action: 'approve' | 'reject') => Promise<void>;

  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  createAdmin: (name: string, email: string, password: string) => Promise<boolean>;
  setupMasterAdmin: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (password: string) => Promise<boolean>; 
  initiateRecovery: (email: string) => Promise<{ success: boolean, message: string, code?: string }>;
  completeRecovery: (email: string, code: string, newPassword: string) => Promise<{ success: boolean, message: string }>;
  
  initiateProfileUpdate: (newEmail?: string, newPassword?: string, newProfilePic?: string) => Promise<{ code: string, message: string } | null>;
  completeProfileUpdate: (code: string) => Promise<boolean>;
  
  updateEmailSettings: (settings: EmailSettings) => Promise<void>;
  updateSubscriptionSettings: (settings: SubscriptionSettings) => Promise<void>;
  updateAdSettings: (settings: AdSettings) => Promise<void>;

  getAnalytics: () => AnalyticsData;

  addArticle: (article: Article) => Promise<void>;
  updateArticle: (article: Article) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  incrementArticleView: (id: string) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  addEPaperPage: (page: EPaperPage) => Promise<void>;
  deleteEPaperPage: (id: string) => Promise<void>;
  deleteAllEPaperPages: () => Promise<void>;
  addClipping: (clipping: Clipping) => Promise<void>;
  deleteClipping: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  toggleUserSubscription: (id: string) => Promise<void>; 
  toggleUserAdStatus: (id: string) => Promise<void>;
  addAdvertisement: (ad: Advertisement) => Promise<void>;
  updateAdvertisement: (ad: Advertisement) => Promise<void>;
  deleteAdvertisement: (id: string) => Promise<void>;
  toggleAdStatus: (id: string) => Promise<void>;
  trackAdClick: (id: string) => Promise<void>;
  updateWatermarkSettings: (settings: WatermarkSettings) => Promise<void>;
  approveContent: (type: 'article' | 'ad' | 'epaper', id: string) => Promise<void>;
  rejectContent: (type: 'article' | 'ad' | 'epaper', id: string) => Promise<void>;

  // Comment Functions
  addComment: (articleId: string, content: string) => Promise<void>;
  voteComment: (commentId: string, type: 'like' | 'dislike') => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Contact Functions
  sendContactMessage: (name: string, email: string, subject: string, message: string) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Classifieds Functions
  addClassified: (classified: Classified) => Promise<void>;
  deleteClassified: (id: string) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES); 
  const [categories, setCategories] = useState<string[]>(['World', 'Business', 'Technology', 'Culture', 'Sports', 'Opinion']);
  const [ePaperPages, setEPaperPages] = useState<EPaperPage[]>(INITIAL_EPAPER_PAGES); 
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(INITIAL_ADS); 
  const [comments, setComments] = useState<Comment[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>(INITIAL_CLASSIFIEDS); 
  const [securityRequests, setSecurityRequests] = useState<SecurityRequest[]>([]);

  // Device ID Management
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  // Settings State 
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>(() => {
      const saved = localStorage.getItem('cj_watermark_settings');
      return saved ? JSON.parse(saved) : { text: 'CJ NEWS HUB', logoUrl: null };
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
      const saved = localStorage.getItem('cj_email_settings');
      return saved ? JSON.parse(saved) : DEFAULT_EMAIL_SETTINGS;
  });

  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>(() => {
      const saved = localStorage.getItem('cj_sub_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTION_SETTINGS;
  });

  const [adSettings, setAdSettings] = useState<AdSettings>(() => {
      try {
          const saved = localStorage.getItem('cj_ad_settings');
          if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed === 'object' && typeof parsed.enableAdsGlobally === 'boolean') {
                  return parsed;
              }
          }
      } catch (e) {
          console.warn("Failed to load ad settings, using default:", e);
      }
      return DEFAULT_AD_SETTINGS;
  });

  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [profileUpdateRequests, setProfileUpdateRequests] = useState<ProfileUpdateRequest[]>([]);
  const [visitorIp, setVisitorIp] = useState<string>('');

  // --- DERIVED STATE ---
  const showAds = useMemo(() => {
      if (adSettings.enableAdsGlobally === false) return false;
      if (currentUser?.subscriptionPlan === 'premium') return false;
      if (currentUser?.isAdFree) return false;
      return true;
  }, [adSettings, currentUser]);

  // --- INITIAL DATA LOAD & SEEDING ---
  const fetchData = async () => {
      if(!supabase) return;
      
      // Load Security Requests (simulated table)
      try {
          // For demo, we store requests in localStorage to persist across refreshes
          const savedReqs = localStorage.getItem('cj_security_requests');
          if (savedReqs) setSecurityRequests(JSON.parse(savedReqs));
      } catch (e) {}

      const loadTable = async <T,>(table: string, fallback: T[], setter: (data: T[]) => void) => {
          try {
            const { data, error } = await supabase.from(table).select('*');
            if (error || !data || data.length === 0) {
                setter(fallback);
                return;
            }
            setter(data as T[]);
          } catch (err) {
              setter(fallback);
          }
      };

      await Promise.all([
          loadTable<Article>('articles', INITIAL_ARTICLES, setArticles),
          loadTable<User>('users', INITIAL_USERS, setUsers),
          loadTable<EPaperPage>('epaper_pages', INITIAL_EPAPER_PAGES, setEPaperPages),
          loadTable<Advertisement>('advertisements', INITIAL_ADS, setAdvertisements),
          loadTable<Classified>('classifieds', INITIAL_CLASSIFIEDS, setClassifieds),
      ]);
  };

  useEffect(() => {
    // 1. Setup Visitor IP
    let ip = localStorage.getItem('cj_visitor_ip');
    if (!ip) {
       ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
       localStorage.setItem('cj_visitor_ip', ip);
    }
    setVisitorIp(ip);

    // 2. Setup Device ID (Persistent Unique ID for this browser)
    let dId = localStorage.getItem('cj_device_id');
    if (!dId) {
        dId = `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        localStorage.setItem('cj_device_id', dId);
    }
    setCurrentDeviceId(dId);

    fetchData();

    // Persist session locally
    const savedUser = localStorage.getItem('cj_current_user');
    if(savedUser) {
        setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync user to local storage for persistence
  useEffect(() => {
    try {
        if (currentUser) {
            localStorage.setItem('cj_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('cj_current_user');
        }
    } catch (e) {
        console.error("Local storage error:", e);
    }
  }, [currentUser]);

  // Sync security requests to local storage (simulating DB)
  useEffect(() => {
      localStorage.setItem('cj_security_requests', JSON.stringify(securityRequests));
  }, [securityRequests]);

  // --- SECURITY FUNCTIONS ---

  const requestAccess = async (email: string, password: string, type: 'login' | 'recovery'): Promise<{ success: boolean; message: string; requestId?: string }> => {
      // Find user
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Basic credential check for login flow (security practice: don't reveal if user exists, but for demo we do)
      if (!user) return { success: false, message: "User not found." };
      if (type === 'login' && user.password !== password) return { success: false, message: "Invalid credentials." };

      // Check if device is already trusted
      if (user.trustedDevices && user.trustedDevices.includes(currentDeviceId)) {
          return { success: true, message: "Device Verified." }; // Allow immediate access
      }

      // If not trusted, create a request
      const existingReq = securityRequests.find(r => r.userId === user.id && r.deviceId === currentDeviceId && r.status === 'pending');
      if (existingReq) {
          return { success: false, message: "Approval Pending", requestId: existingReq.id };
      }

      const newRequest: SecurityRequest = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          deviceId: currentDeviceId,
          type: type,
          status: 'pending',
          timestamp: Date.now(),
          ip: visitorIp
      };

      setSecurityRequests(prev => [...prev, newRequest]);
      return { success: false, message: "New Device Detected. Approval required.", requestId: newRequest.id };
  };

  const checkRequestStatus = async (requestId: string): Promise<SecurityRequest['status']> => {
      const req = securityRequests.find(r => r.id === requestId);
      return req ? req.status : 'rejected';
  };

  const respondToSecurityRequest = async (requestId: string, action: 'approve' | 'reject') => {
      setSecurityRequests(prev => prev.map(req => {
          if (req.id === requestId) {
              return { ...req, status: action === 'approve' ? 'approved' : 'rejected' };
          }
          return req;
      }));

      // If approved, add device to user's trusted list
      if (action === 'approve') {
          const req = securityRequests.find(r => r.id === requestId);
          if (req) {
              setUsers(prevUsers => prevUsers.map(u => {
                  if (u.id === req.userId) {
                      const updatedTrusted = [...(u.trustedDevices || []), req.deviceId];
                      // Also update currentUser if it's the same user (though this function runs on the Approver's device)
                      if (currentUser && currentUser.id === u.id) {
                          const updatedCurrentUser = { ...currentUser, trustedDevices: updatedTrusted };
                          setCurrentUser(updatedCurrentUser);
                      }
                      return { ...u, trustedDevices: updatedTrusted };
                  }
                  return u;
              }));
              // In real app, sync to DB here
          }
      }
  };

  const login = async (email: string, password: string, role?: UserRole): Promise<User | null> => {
    // Note: The UI calls requestAccess first. This function assumes device is verified or user forces login (if logic permits).
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        if (role && user.role !== role && user.role !== 'admin') return null;
        if (user.status === 'blocked' || user.status === 'pending') return null;
        
        // Auto-add trusted device if not present (legacy support or first login simulation)
        if (!user.trustedDevices?.includes(currentDeviceId)) {
             // Ideally we shouldn't do this without the approval flow, but for the very first user/admin setup we might need it.
             // For strict mode: DO NOT auto-add.
        }
        
        setCurrentUser(user);
        return user;
    }
    return null;
  };

  // ... (Register/CreateAdmin remain mostly same, just add trustedDevices: []) ...
  const register = async (name: string, email: string, password: string, role: UserRole = 'publisher'): Promise<{ success: boolean; message?: string }> => {
    if(!supabase) return { success: false, message: "Database error" };
    const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
    if(existing) return { success: false, message: "Email already registered." };
    const initialStatus = role === 'publisher' ? 'pending' : 'active';
    const newUser: User = {
      id: Date.now().toString(),
      name, email, password, role, status: initialStatus,
      ip: visitorIp,
      joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      subscriptionPlan: role === 'subscriber' ? 'free' : undefined,
      profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      trustedDevices: [currentDeviceId] // Trust the device used for registration
    };
    const { error: dbError } = await supabase.from('users').insert([newUser]);
    setUsers(prev => [...prev, newUser]);
    if (initialStatus === 'active') setCurrentUser(newUser);
    return { success: true };
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      if (!currentUser || currentUser.role !== 'admin') return false;
      const newAdmin: User = {
          id: Date.now().toString(),
          name, email, password, role: 'admin', status: 'active',
          ip: visitorIp,
          joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
          trustedDevices: [] 
      };
      setUsers(prev => [...prev, newAdmin]);
      return true;
  };

  const setupMasterAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      const existingAdmins = users.filter(u => u.role === 'admin');
      if (existingAdmins.length > 0) return false;
      const masterAdmin: User = {
          id: CHIEF_EDITOR_ID, name, email, password, role: 'admin', status: 'active',
          ip: visitorIp,
          joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          profilePicUrl: `https://i.pravatar.cc/150?u=admin`,
          trustedDevices: [currentDeviceId] // Trust setup device
      };
      setUsers(prev => [...prev, masterAdmin]);
      setCurrentUser(masterAdmin); // Auto login master admin
      return true;
  };

  const logout = async () => {
    localStorage.removeItem('cj_current_user');
    setCurrentUser(null);
  };

  const initiateRecovery = async (email: string): Promise<{ success: boolean, message: string, code?: string }> => {
      // Step 1: Check if user exists
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { success: false, message: "Email not found." };

      // Step 2: Check Device Trust
      if (!user.trustedDevices || !user.trustedDevices.includes(currentDeviceId)) {
          // Trigger Security Request
          const result = await requestAccess(email, '', 'recovery'); 
          // Note: Password empty because we don't know it, requestAccess handles type 'recovery' properly
          return { success: false, message: "Unrecognized Device. Approval request sent to your active devices.", code: undefined };
      }

      // Step 3: Generate Code (Only if Trusted)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newRequest: RecoveryRequest = {
          email: user.email,
          userName: user.name,
          code: code,
          timestamp: Date.now()
      };
      setRecoveryRequests(prev => [...prev, newRequest]);
      return { success: true, message: `Device Verified. Verification code: ${code}`, code: code };
  };

  const completeRecovery = async (email: string, code: string, newPassword: string): Promise<{ success: boolean, message: string }> => {
      const request = recoveryRequests.find(r => r.email.toLowerCase() === email.toLowerCase() && r.code === code);
      if (!request) return { success: false, message: "Invalid verification code." };
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { success: false, message: "User not found." };
      
      const updatedUser = { ...user, password: newPassword };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setRecoveryRequests(prev => prev.filter(r => r !== request));
      return { success: true, message: "Password updated successfully." };
  };

  // ... (Keep existing simple implementations for profile update, settings, etc.) ...
  const resetPassword = async (password: string) => true;
  const initiateProfileUpdate = async (newEmail?: string, newPassword?: string, newProfilePic?: string) => {
      if (!currentUser) return null;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const request: ProfileUpdateRequest = { userId: currentUser.id, newEmail, newPassword, newProfilePic, verificationCode: code, timestamp: Date.now() };
      setProfileUpdateRequests(prev => [...prev, request]);
      return { code, message: `Verification code: ${code}` };
  };
  const completeProfileUpdate = async (code: string) => {
      if (!currentUser) return false;
      const request = profileUpdateRequests.find(r => r.userId === currentUser.id && r.verificationCode === code);
      if (!request) return false;
      const updates: Partial<User> = {};
      if (request.newEmail) updates.email = request.newEmail;
      if (request.newPassword) updates.password = request.newPassword;
      if (request.newProfilePic) updates.profilePicUrl = request.newProfilePic;
      const updatedUser = { ...currentUser, ...updates };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u));
      setCurrentUser(updatedUser);
      setProfileUpdateRequests(prev => prev.filter(r => r !== request));
      return true;
  };
  const updateEmailSettings = async (settings: EmailSettings) => setEmailSettings(settings);
  const updateSubscriptionSettings = async (settings: SubscriptionSettings) => setSubscriptionSettings(settings);
  const updateAdSettings = async (settings: AdSettings) => setAdSettings(settings);
  const updateWatermarkSettings = async (settings: WatermarkSettings) => setWatermarkSettings(settings);
  
  const getAnalytics = (): AnalyticsData => {
      return { totalViews: 1250, avgViewsPerArticle: 45, categoryDistribution: [], dailyVisits: [], geoSources: [] };
  };

  // ... (Other standard CRUD functions) ...
  const addArticle = async (article: Article) => setArticles(prev => [article, ...prev]);
  const updateArticle = async (updatedArticle: Article) => setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
  const deleteArticle = async (id: string) => setArticles(prev => prev.filter(a => a.id !== id));
  const incrementArticleView = async (id: string) => {};
  const addCategory = async (category: string) => setCategories(prev => [...prev, category]);
  const deleteCategory = async (category: string) => setCategories(prev => prev.filter(c => c !== category));
  const addEPaperPage = async (page: EPaperPage) => setEPaperPages(prev => [...prev, page]);
  const deleteEPaperPage = async (id: string) => setEPaperPages(prev => prev.filter(p => p.id !== id));
  const deleteAllEPaperPages = async () => setEPaperPages([]);
  const addClipping = async (clipping: Clipping) => setClippings(prev => [clipping, ...prev]);
  const deleteClipping = async (id: string) => setClippings(prev => prev.filter(c => c.id !== id));
  const deleteUser = async (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const toggleUserStatus = async (id: string) => {};
  const toggleUserSubscription = async (id: string) => {};
  const toggleUserAdStatus = async (id: string) => {};
  const addAdvertisement = async (ad: Advertisement) => setAdvertisements(prev => [...prev, ad]);
  const updateAdvertisement = async (ad: Advertisement) => setAdvertisements(prev => prev.map(a => a.id === ad.id ? ad : a));
  const deleteAdvertisement = async (id: string) => setAdvertisements(prev => prev.filter(a => a.id !== id));
  const toggleAdStatus = async (id: string) => {};
  const trackAdClick = async (id: string) => {};
  const approveContent = async (type: string, id: string) => {};
  const rejectContent = async (type: string, id: string) => {};
  const addComment = async (articleId: string, content: string) => {};
  const voteComment = async () => {};
  const deleteComment = async () => {};
  const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
      const msg: ContactMessage = { id: Date.now().toString(), name, email, subject, message, timestamp: Date.now(), read: false };
      setContactMessages(prev => [msg, ...prev]);
  };
  const markMessageAsRead = async (id: string) => setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  const deleteMessage = async (id: string) => setContactMessages(prev => prev.filter(m => m.id !== id));
  const addClassified = async (c: Classified) => setClassifieds(prev => [c, ...prev]);
  const deleteClassified = async (id: string) => setClassifieds(prev => prev.filter(c => c.id !== id));

  return (
    <NewsContext.Provider value={{
      articles, categories, ePaperPages, clippings, currentUser, users, advertisements,
      watermarkSettings, recoveryRequests, emailSettings, subscriptionSettings, adSettings,
      comments, contactMessages, classifieds, showAds, currentDeviceId, securityRequests,
      login, register, createAdmin, setupMasterAdmin, logout, resetPassword, initiateRecovery, completeRecovery,
      initiateProfileUpdate, completeProfileUpdate, updateEmailSettings, updateSubscriptionSettings,
      updateAdSettings, getAnalytics, addArticle, updateArticle, deleteArticle, incrementArticleView,
      addCategory, deleteCategory, addEPaperPage, deleteEPaperPage, deleteAllEPaperPages, addClipping,
      deleteClipping, deleteUser, toggleUserStatus, toggleUserSubscription, toggleUserAdStatus,
      addAdvertisement, updateAdvertisement, deleteAdvertisement, toggleAdStatus, trackAdClick,
      updateWatermarkSettings, approveContent, rejectContent, addComment, voteComment, deleteComment,
      sendContactMessage, markMessageAsRead, deleteMessage, addClassified, deleteClassified,
      requestAccess, checkRequestStatus, respondToSecurityRequest
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) throw new Error('useNews must be used within a NewsProvider');
  return context;
};
