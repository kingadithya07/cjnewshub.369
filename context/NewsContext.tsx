
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article, EPaperPage, Clipping, User, UserRole, Advertisement, WatermarkSettings, RecoveryRequest, ProfileUpdateRequest, EmailSettings, SubscriptionSettings, AdSettings, AnalyticsData, Comment, ContactMessage, Classified } from '../types';
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
  
  login: (email: string, password: string, role?: UserRole) => Promise<User | null>;
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
      const saved = localStorage.getItem('cj_ad_settings');
      return saved ? JSON.parse(saved) : DEFAULT_AD_SETTINGS;
  });

  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [profileUpdateRequests, setProfileUpdateRequests] = useState<ProfileUpdateRequest[]>([]);
  const [visitorIp, setVisitorIp] = useState<string>('');

  // --- INITIAL DATA LOAD & SEEDING ---
  const fetchData = async () => {
      if(!supabase) return;
      console.log("Fetching data from Supabase...");

      const loadTable = async <T,>(table: string, fallback: T[], setter: (data: T[]) => void) => {
          try {
            const { data, error } = await supabase.from(table).select('*');
            
            if (error) {
                console.warn(`Supabase error fetching ${table}:`, error.message);
                setter(fallback);
                return;
            }

            if (data && data.length > 0) {
                setter(data as T[]);
            } else {
                console.log(`Table ${table} is empty. Attempting to seed...`);
                // Note: We do NOT auto-seed users anymore to respect security of empty slate
                if (table !== 'users') {
                    const { error: insertError } = await supabase.from(table).insert(fallback as any);
                    if (insertError) {
                        console.warn(`Failed to seed ${table}:`, insertError.message);
                    }
                }
                setter(fallback);
            }
          } catch (err) {
              console.error(`Unexpected error loading ${table}:`, err);
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

      const { data: commentsData } = await supabase.from('comments').select('*');
      if(commentsData) setComments(commentsData);

      const { data: msgsData } = await supabase.from('messages').select('*');
      if(msgsData) setContactMessages(msgsData);

      const { data: clipsData } = await supabase.from('clippings').select('*');
      if(clipsData) setClippings(clipsData);
  };

  useEffect(() => {
    let ip = localStorage.getItem('cj_visitor_ip');
    if (!ip) {
       ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
       localStorage.setItem('cj_visitor_ip', ip);
    }
    setVisitorIp(ip);

    fetchData();

    // Persist session locally to handle refresh since we are bypassing Supabase Auth for Admin
    const savedUser = localStorage.getItem('cj_current_user');
    if(savedUser) {
        setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync user to local storage for persistence
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('cj_current_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('cj_current_user');
    }
  }, [currentUser]);

  // --- PERSIST SETTINGS (Local only for now) ---
  useEffect(() => localStorage.setItem('cj_watermark_settings', JSON.stringify(watermarkSettings)), [watermarkSettings]);
  useEffect(() => localStorage.setItem('cj_email_settings', JSON.stringify(emailSettings)), [emailSettings]);
  useEffect(() => localStorage.setItem('cj_sub_settings', JSON.stringify(subscriptionSettings)), [subscriptionSettings]);
  useEffect(() => localStorage.setItem('cj_ad_settings', JSON.stringify(adSettings)), [adSettings]);


  // --- FUNCTIONS ---

  const login = async (email: string, password: string, role?: UserRole): Promise<User | null> => {
    if(!supabase) return null;

    // Direct Database Query (Bypassing Auth for simplicity/Admin usage as requested)
    // We check the 'users' table which contains our user data and passwords (plain text in this demo context)
    
    // 1. Fetch from DB (or fallback to local state if DB fails/empty)
    const { data: dbUser } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
    
    let foundUser = dbUser;

    // Fallback: Check local state if DB return nothing (e.g. if offline or sync issue)
    if (!foundUser) {
        foundUser = users.find(u => u.email === email && u.password === password);
    }

    if (!foundUser) {
        return null;
    }

    // 2. Role and Status Check
    if (role && foundUser.role !== role && foundUser.role !== 'admin') { 
        // Allow admins to login to any role interface
        return null;
    }

    if (foundUser.status === 'blocked') throw new Error("Account is blocked.");
    if (foundUser.status === 'pending') throw new Error("Account is pending approval.");

    setCurrentUser(foundUser);
    return foundUser;
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'publisher'): Promise<{ success: boolean; message?: string }> => {
    if(!supabase) return { success: false, message: "Database error" };

    // Check existing
    const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
    if(existing) return { success: false, message: "Email already registered." };

    const initialStatus = role === 'publisher' ? 'pending' : 'active';
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password, // Storing password for direct login
      role: role, 
      status: initialStatus,
      ip: visitorIp,
      joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      subscriptionPlan: role === 'subscriber' ? 'free' : undefined,
      profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    const { error: dbError } = await supabase.from('users').insert([newUser]);
    
    if (dbError) {
        console.error("Profile creation error:", dbError);
        // Fallback
        setUsers(prev => [...prev, newUser]);
    } else {
        setUsers(prev => [...prev, newUser]);
    }
    
    // Auto login if active
    if (initialStatus === 'active') {
        setCurrentUser(newUser);
    }

    if (initialStatus === 'pending') {
        return { success: true, message: "Registration successful! Your account is pending admin approval." };
    }

    return { success: true };
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      if(!supabase) return false;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return false; // Only Main Admin can create others
      
      const newAdmin: User = {
          id: Date.now().toString(),
          name,
          email,
          password,
          role: 'admin',
          status: 'active',
          ip: visitorIp,
          joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
      };
      
      const { error } = await supabase.from('users').insert([newAdmin]);
      if(!error) setUsers(prev => [...prev, newAdmin]);
      return !error;
  };

  // Special One-Time Setup Function
  const setupMasterAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      if(!supabase) return false;
      
      // Check if ANY admin already exists
      const existingAdmins = users.filter(u => u.role === 'admin');
      
      // Double check DB
      const { data: dbAdmins } = await supabase.from('users').select('*').eq('role', 'admin');
      
      if (existingAdmins.length > 0 || (dbAdmins && dbAdmins.length > 0)) {
          console.warn("Setup blocked: Admins already exist.");
          return false;
      }

      const masterAdmin: User = {
          id: CHIEF_EDITOR_ID, // Use the constant ID for logic compatibility
          name,
          email,
          password,
          role: 'admin',
          status: 'active',
          ip: visitorIp,
          joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          profilePicUrl: `https://i.pravatar.cc/150?u=admin`
      };

      const { error } = await supabase.from('users').insert([masterAdmin]);
      if (error) {
          console.error("DB Setup Error", error);
          // Fallback to local state so user can login in this session even if DB fails
      }
      
      setUsers(prev => [...prev, masterAdmin]);
      return true;
  };

  const logout = async () => {
    // await supabase.auth.signOut(); // Not needed for custom auth
    localStorage.removeItem('cj_current_user');
    setCurrentUser(null);
  };

  // Internal Code Generation for Recovery
  const initiateRecovery = async (email: string): Promise<{ success: boolean, message: string, code?: string }> => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
          return { success: false, message: "Email not found in our records." };
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newRequest: RecoveryRequest = {
          email: user.email,
          userName: user.name,
          code: code,
          timestamp: Date.now()
      };
      
      setRecoveryRequests(prev => [...prev, newRequest]);

      // In a real app, this would send an email. 
      // Here we return the code to display in a popup/alert as requested.
      return { 
          success: true, 
          message: `Verification code generated: ${code}`,
          code: code 
      };
  };

  const completeRecovery = async (email: string, code: string, newPassword: string): Promise<{ success: boolean, message: string }> => {
      const request = recoveryRequests.find(r => r.email.toLowerCase() === email.toLowerCase() && r.code === code);
      
      if (!request) {
          return { success: false, message: "Invalid verification code." };
      }

      // Find user to update
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { success: false, message: "User not found." };

      // Update in DB
      const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', user.id);
      
      if (error) {
          // Fallback update local state if DB fails (e.g. connection issue)
          console.warn("DB update failed, updating local state only");
      }

      // Update local state
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
      
      // Clean up request
      setRecoveryRequests(prev => prev.filter(r => r !== request));

      return { success: true, message: "Password updated successfully." };
  };

  // Deprecated stub
  const resetPassword = async (password: string) => true;

  // --- Profile Updates ---
  const initiateProfileUpdate = async (newEmail?: string, newPassword?: string, newProfilePic?: string): Promise<{ code: string, message: string } | null> => {
      if (!currentUser) return null;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      // Store request... (Implementation simplified for brevity as focus is on login/recovery)
      return { code, message: `Verification code: ${code}` };
  };

  const completeProfileUpdate = async (code: string): Promise<boolean> => {
      return true; // Simplified
  };
  
  const updateEmailSettings = async (settings: EmailSettings) => setEmailSettings(settings);
  const updateSubscriptionSettings = async (settings: SubscriptionSettings) => setSubscriptionSettings(settings);
  const updateAdSettings = async (settings: AdSettings) => setAdSettings(settings);

  const getAnalytics = (): AnalyticsData => {
      const categoryMap: Record<string, number> = {};
      let totalViews = 0;
      articles.forEach(article => {
          const v = article.views || 0;
          totalViews += v;
          categoryMap[article.category] = (categoryMap[article.category] || 0) + v;
      });
      const avgViewsPerArticle = articles.length > 0 ? Math.round(totalViews / articles.length) : 0;
      const colors = ['#B89E72', '#1A1A1A', '#555555', '#9A845C', '#D4C4A8', '#777777'];
      const categoryDistribution = Object.entries(categoryMap)
          .map(([category, count], index) => ({
              category, count, percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0, color: colors[index % colors.length]
          })).sort((a, b) => b.count - a.count);
      const dailyVisits = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          if (totalViews === 0) return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), visits: 0 };
          const baseDaily = totalViews / 7; const randomFactor = 0.5 + Math.random() * 1.0; 
          return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), visits: Math.round(baseDaily * randomFactor) };
      });
      const geoSources = totalViews === 0 ? [{ country: 'United States', percentage: 0 }] : [{ country: 'United States', percentage: 42 }];
      return { totalViews, avgViewsPerArticle, categoryDistribution, dailyVisits, geoSources };
  };

  const addArticle = async (article: Article) => {
    if(!supabase) return;
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? article.status : 'pending';
    const newArticle = { ...article, status };
    setArticles(prev => [newArticle, ...prev]);
    await supabase.from('articles').insert([newArticle]);
  };

  const updateArticle = async (updatedArticle: Article) => {
    if(!supabase) return;
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? updatedArticle.status : 'pending';
    const finalArticle = { ...updatedArticle, status };
    setArticles(prev => prev.map(a => a.id === finalArticle.id ? finalArticle : a));
    await supabase.from('articles').update(finalArticle).eq('id', finalArticle.id);
  };

  const deleteArticle = async (id: string) => {
    if(!supabase) return;
    setArticles(prev => prev.filter(a => a.id !== id));
    await supabase.from('articles').delete().eq('id', id);
  };

  const incrementArticleView = async (id: string) => {
    if(!supabase) return;
    const article = articles.find(a => a.id === id);
    if(article) {
        const newViews = (article.views || 0) + 1;
        setArticles(prev => prev.map(a => a.id === id ? { ...a, views: newViews } : a));
        await supabase.from('articles').update({ views: newViews }).eq('id', id);
    }
  };

  const addCategory = async (category: string) => {
      if (category.trim() && !categories.includes(category.trim())) setCategories(prev => [...prev, category.trim()]);
  };
  const deleteCategory = async (category: string) => setCategories(prev => prev.filter(c => c !== category));

  const addEPaperPage = async (page: EPaperPage) => {
    if(!supabase) return;
    const status: 'active' | 'pending' = currentUser?.id === CHIEF_EDITOR_ID ? 'active' : 'pending';
    const newPage = { ...page, status };
    setEPaperPages(prev => [...prev, newPage]);
    await supabase.from('epaper_pages').insert([newPage]);
  };
  const deleteEPaperPage = async (id: string) => {
    if(!supabase) return;
    setEPaperPages(prev => prev.filter(p => p.id !== id));
    await supabase.from('epaper_pages').delete().eq('id', id);
  };
  const deleteAllEPaperPages = async () => {
    if(!supabase) return;
    setEPaperPages([]);
    await supabase.from('epaper_pages').delete().neq('id', '0');
  };

  const addClipping = async (clipping: Clipping) => {
    if(!supabase) return;
    const finalClipping = { ...clipping, userId: currentUser?.id };
    setClippings(prev => [finalClipping, ...prev]);
    await supabase.from('clippings').insert([finalClipping]);
  };
  const deleteClipping = async (id: string) => {
    if(!supabase) return;
    setClippings(prev => prev.filter(c => c.id !== id));
    await supabase.from('clippings').delete().eq('id', id);
  };

  const deleteUser = async (id: string) => {
    if(!supabase) return;
    if (id === CHIEF_EDITOR_ID) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    await supabase.from('users').delete().eq('id', id);
  };

  const toggleUserStatus = async (id: string) => {
    if(!supabase) return;
    if (id === CHIEF_EDITOR_ID) return;
    const user = users.find(u => u.id === id);
    if(user) {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        await supabase.from('users').update({ status: newStatus }).eq('id', id);
    }
  };
  
  const toggleUserSubscription = async (id: string) => {
      if(!supabase) return;
      const user = users.find(u => u.id === id);
      if(user) {
          const newPlan = user.subscriptionPlan === 'premium' ? 'free' : 'premium';
          const isAdFree = newPlan === 'premium';
          setUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionPlan: newPlan, isAdFree } : u));
          if (currentUser?.id === id) setCurrentUser(prev => prev ? ({ ...prev, subscriptionPlan: newPlan, isAdFree }) : null);
          await supabase.from('users').update({ subscriptionPlan: newPlan, isAdFree }).eq('id', id);
      }
  };
  const toggleUserAdStatus = async (id: string) => {
      if(!supabase) return;
      const user = users.find(u => u.id === id);
      if(user) {
          const newStatus = !user.isAdFree;
          setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdFree: newStatus } : u));
          if (currentUser?.id === id) setCurrentUser(prev => prev ? ({ ...prev, isAdFree: newStatus }) : null);
          await supabase.from('users').update({ isAdFree: newStatus }).eq('id', id);
      }
  };

  const addAdvertisement = async (ad: Advertisement) => {
      if(!supabase) return;
      const status = currentUser?.id === CHIEF_EDITOR_ID ? ad.status : 'pending';
      const newAd = { ...ad, status };
      setAdvertisements(prev => [...prev, newAd]);
      await supabase.from('advertisements').insert([newAd]);
  };
  const updateAdvertisement = async (updatedAd: Advertisement) => {
      if(!supabase) return;
      const status = currentUser?.id === CHIEF_EDITOR_ID ? updatedAd.status : 'pending';
      const finalAd = { ...updatedAd, status };
      setAdvertisements(prev => prev.map(a => a.id === updatedAd.id ? finalAd : a));
      await supabase.from('advertisements').update(finalAd).eq('id', finalAd.id);
  };
  const deleteAdvertisement = async (id: string) => {
      if(!supabase) return;
      setAdvertisements(prev => prev.filter(a => a.id !== id));
      await supabase.from('advertisements').delete().eq('id', id);
  };
  const toggleAdStatus = async (id: string) => {
      if(!supabase) return;
      const ad = advertisements.find(a => a.id === id);
      if(ad) {
          const newStatus = ad.status === 'active' ? 'inactive' : 'active';
          setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
          await supabase.from('advertisements').update({ status: newStatus }).eq('id', id);
      }
  };
  const trackAdClick = async (id: string) => {
      if(!supabase) return;
      const ad = advertisements.find(a => a.id === id);
      if (ad && !ad.clickedIps.includes(visitorIp)) {
          const newClicks = (ad.clicks || 0) + 1;
          const newIps = [...ad.clickedIps, visitorIp];
          setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, clicks: newClicks, clickedIps: newIps } : a));
          await supabase.from('advertisements').update({ clicks: newClicks, clickedIps: newIps }).eq('id', id);
      }
  };
  const updateWatermarkSettings = async (settings: WatermarkSettings) => setWatermarkSettings(settings);
  const approveContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if(!supabase) return;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;
      const table = type === 'article' ? 'articles' : type === 'ad' ? 'advertisements' : 'epaper_pages';
      await supabase.from(table).update({ status: type === 'ad' || type === 'epaper' ? 'active' : 'published' }).eq('id', id);
      fetchData(); // refresh
  };
  const rejectContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if(!supabase) return;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;
      const table = type === 'article' ? 'articles' : type === 'ad' ? 'advertisements' : 'epaper_pages';
      if(type === 'epaper') await supabase.from(table).delete().eq('id', id);
      else await supabase.from(table).update({ status: type === 'article' ? 'draft' : 'inactive' }).eq('id', id);
      fetchData();
  };
  const addComment = async (articleId: string, content: string) => {
      if (!currentUser || !supabase) return;
      const newComment: Comment = {
          id: Date.now().toString(),
          articleId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.profilePicUrl,
          content,
          timestamp: Date.now(),
          likes: 0, dislikes: 0, likedBy: [], dislikedBy: []
      };
      setComments(prev => [newComment, ...prev]);
      await supabase.from('comments').insert([newComment]);
  };
  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
      if (!currentUser || !supabase) return; 
      // Simplified Optimistic UI
  };
  const deleteComment = async (commentId: string) => {
      if(!supabase) return;
      setComments(prev => prev.filter(c => c.id !== commentId));
      await supabase.from('comments').delete().eq('id', commentId);
  };
  const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
      if(!supabase) return;
      const newMessage: ContactMessage = {
          id: Date.now().toString(),
          name, email, subject, message, timestamp: Date.now(), read: false
      };
      setContactMessages(prev => [newMessage, ...prev]);
      await supabase.from('messages').insert([newMessage]);
  };
  const markMessageAsRead = async (id: string) => {
      if(!supabase) return;
      setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
      await supabase.from('messages').update({ read: true }).eq('id', id);
  };
  const deleteMessage = async (id: string) => {
      if(!supabase) return;
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
      await supabase.from('messages').delete().eq('id', id);
  };
  const addClassified = async (classified: Classified) => {
      if(!supabase) return;
      setClassifieds(prev => [classified, ...prev]);
      await supabase.from('classifieds').insert([classified]);
  };
  const deleteClassified = async (id: string) => {
      if(!supabase) return;
      setClassifieds(prev => prev.filter(c => c.id !== id));
      await supabase.from('classifieds').delete().eq('id', id);
  };

  return (
    <NewsContext.Provider value={{
      articles, categories, ePaperPages, clippings, currentUser, users, advertisements,
      watermarkSettings, recoveryRequests, emailSettings, subscriptionSettings, adSettings,
      comments, contactMessages, classifieds,
      login, register, createAdmin, setupMasterAdmin, logout, resetPassword, initiateRecovery, completeRecovery,
      initiateProfileUpdate, completeProfileUpdate, updateEmailSettings, updateSubscriptionSettings,
      updateAdSettings, getAnalytics, addArticle, updateArticle, deleteArticle, incrementArticleView,
      addCategory, deleteCategory, addEPaperPage, deleteEPaperPage, deleteAllEPaperPages, addClipping,
      deleteClipping, deleteUser, toggleUserStatus, toggleUserSubscription, toggleUserAdStatus,
      addAdvertisement, updateAdvertisement, deleteAdvertisement, toggleAdStatus, trackAdClick,
      updateWatermarkSettings, approveContent, rejectContent, addComment, voteComment, deleteComment,
      sendContactMessage, markMessageAsRead, deleteMessage, addClassified, deleteClassified
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
