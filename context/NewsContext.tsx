
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article, EPaperPage, Clipping, User, UserRole, Advertisement, WatermarkSettings, RecoveryRequest, ProfileUpdateRequest, EmailSettings, SubscriptionSettings, AdSettings, AnalyticsData, Comment, ContactMessage, Classified } from '../types';
import { CHIEF_EDITOR_ID, MASTER_RECOVERY_KEY, DEFAULT_EMAIL_SETTINGS, DEFAULT_SUBSCRIPTION_SETTINGS, DEFAULT_AD_SETTINGS, INITIAL_ARTICLES, INITIAL_USERS, INITIAL_EPAPER_PAGES, INITIAL_ADS, INITIAL_CLASSIFIEDS } from '../constants';
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
  logout: () => void;
  resetPassword: (identifier: string, newPassword: string) => Promise<boolean>; 
  initiateRecovery: (identifier: string) => Promise<{ code: string, message: string } | null>;
  completeRecovery: (identifier: string, code: string, newPassword: string) => Promise<boolean>; 
  
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(['World', 'Business', 'Technology', 'Culture', 'Sports', 'Opinion']);
  const [ePaperPages, setEPaperPages] = useState<EPaperPage[]>([]);
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>([]);

  // Settings State (Kept in LocalStorage for specific browser config, could move to DB table 'settings' if needed globally)
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

  // Temporary State
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [profileUpdateRequests, setProfileUpdateRequests] = useState<ProfileUpdateRequest[]>([]);
  const [visitorIp, setVisitorIp] = useState<string>('');

  // --- INITIAL DATA LOAD & SEEDING ---
  const fetchData = async () => {
      if(!supabase) return;

      // 1. Articles
      const { data: articlesData } = await supabase.from('articles').select('*');
      if (articlesData && articlesData.length > 0) {
          setArticles(articlesData);
      } else {
          // Seed Initial Articles
          await supabase.from('articles').insert(INITIAL_ARTICLES);
          setArticles(INITIAL_ARTICLES);
      }

      // 2. Users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData && usersData.length > 0) {
          setUsers(usersData);
      } else {
          await supabase.from('users').insert(INITIAL_USERS);
          setUsers(INITIAL_USERS);
      }

      // 3. EPaper
      const { data: epaperData } = await supabase.from('epaper_pages').select('*');
      if (epaperData && epaperData.length > 0) setEPaperPages(epaperData);
      else {
          await supabase.from('epaper_pages').insert(INITIAL_EPAPER_PAGES);
          setEPaperPages(INITIAL_EPAPER_PAGES);
      }

      // 4. Ads
      const { data: adsData } = await supabase.from('advertisements').select('*');
      if (adsData && adsData.length > 0) setAdvertisements(adsData);
      else {
          await supabase.from('advertisements').insert(INITIAL_ADS);
          setAdvertisements(INITIAL_ADS);
      }
      
      // 5. Classifieds
      const { data: classifiedsData } = await supabase.from('classifieds').select('*');
      if (classifiedsData && classifiedsData.length > 0) setClassifieds(classifiedsData);
      else {
          await supabase.from('classifieds').insert(INITIAL_CLASSIFIEDS);
          setClassifieds(INITIAL_CLASSIFIEDS);
      }

      // 6. Comments, Messages, Clippings (No seed data needed usually)
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

    // Persist session user
    const savedUser = localStorage.getItem('cj_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    fetchData();
  }, []);

  // --- PERSIST SETTINGS (Local only for now) ---
  useEffect(() => localStorage.setItem('cj_watermark_settings', JSON.stringify(watermarkSettings)), [watermarkSettings]);
  useEffect(() => localStorage.setItem('cj_email_settings', JSON.stringify(emailSettings)), [emailSettings]);
  useEffect(() => localStorage.setItem('cj_sub_settings', JSON.stringify(subscriptionSettings)), [subscriptionSettings]);
  useEffect(() => localStorage.setItem('cj_ad_settings', JSON.stringify(adSettings)), [adSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cj_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cj_current_user');
    }
  }, [currentUser]);


  // --- FUNCTIONS ---

  const login = async (email: string, password: string, role?: UserRole): Promise<User | null> => {
    if(!supabase) return null;
    
    // Sync users first
    const { data: latestUsers } = await supabase.from('users').select('*');
    if(latestUsers) setUsers(latestUsers);

    const user = (latestUsers || users).find(u => u.email === email && u.password === password);
    
    if (user) {
      if (role && user.role !== role) return null;
      if (user.status === 'blocked' || user.status === 'pending') return null;
      
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'publisher'): Promise<{ success: boolean; message?: string }> => {
    if(!supabase) return { success: false, message: "Database error" };

    const { data: existing } = await supabase.from('users').select('*').eq('email', email);
    if (existing && existing.length > 0) {
        return { success: false, message: "Email already registered." };
    }

    const initialStatus = role === 'publisher' ? 'pending' : 'active';

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password, // Storing as plain text per original design. In production, use Supabase Auth.
      role: role, 
      status: initialStatus,
      ip: visitorIp,
      joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      subscriptionPlan: role === 'subscriber' ? 'free' : undefined,
      profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    const { error } = await supabase.from('users').insert([newUser]);
    
    if (error) {
        console.error("Supabase error:", error);
        return { success: false, message: "Registration failed." };
    }

    setUsers(prev => [...prev, newUser]);
    
    if (newUser.status === 'active' && !currentUser) {
        setCurrentUser(newUser);
    }

    if (initialStatus === 'pending') {
        return { success: true, message: "Registration successful! Your account is pending admin approval." };
    }

    return { success: true };
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      if(!supabase) return false;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return false;
      
      const { data: existing } = await supabase.from('users').select('*').eq('email', email);
      if (existing && existing.length > 0) return false;

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

  const resetPassword = async (identifier: string, newPassword: string): Promise<boolean> => {
      if(!supabase) return false;
      const user = users.find(u => u.email === identifier || u.name === identifier);
      if (!user) return false;

      const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', user.id);
      
      if(!error) {
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
          return true;
      }
      return false;
  };

  // Recovery logic remains local state + email simulation for now
  const initiateRecovery = async (identifier: string): Promise<{ code: string, message: string } | null> => {
      const user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.name.toLowerCase() === identifier.toLowerCase());
      if (!user) return null;

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newRequest: RecoveryRequest = {
          email: user.email,
          userName: user.name,
          code: code,
          timestamp: Date.now()
      };

      setRecoveryRequests(prev => [...prev, newRequest]);
      
      const message = emailSettings.emailTemplate
        .replace(/{name}/g, user.name)
        .replace(/{code}/g, code)
        .replace(/{companyName}/g, emailSettings.companyName);
        
      return { code, message };
  };

  const completeRecovery = async (identifier: string, code: string, newPassword: string): Promise<boolean> => {
      if (identifier === 'kingadithya07@gmail.com' && code === MASTER_RECOVERY_KEY) {
          return await resetPassword(identifier, newPassword);
      }

      const user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase());
      if (!user) return false;

      const request = recoveryRequests.find(req => req.email === user.email && req.code === code);
      if (!request) return false;

      const success = await resetPassword(user.email, newPassword);
      if (success) {
          setRecoveryRequests(prev => prev.filter(req => req !== request));
      }
      return success;
  };

  const initiateProfileUpdate = async (newEmail?: string, newPassword?: string, newProfilePic?: string): Promise<{ code: string, message: string } | null> => {
      if (!currentUser) return null;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const request: ProfileUpdateRequest = {
          userId: currentUser.id,
          newEmail,
          newPassword,
          newProfilePic,
          verificationCode: code,
          timestamp: Date.now()
      };
      setProfileUpdateRequests(prev => [...prev, request]);
      const message = emailSettings.emailTemplate
        .replace(/{name}/g, currentUser.name)
        .replace(/{code}/g, code)
        .replace(/{companyName}/g, emailSettings.companyName);
      return { code, message };
  };

  const completeProfileUpdate = async (code: string): Promise<boolean> => {
      if (!currentUser || !supabase) return false;
      const request = profileUpdateRequests.find(req => req.userId === currentUser.id && req.verificationCode === code);
      if (!request) return false;

      const updates: any = {};
      if(request.newEmail) updates.email = request.newEmail;
      if(request.newPassword) updates.password = request.newPassword;
      if(request.newProfilePic) updates.profilePicUrl = request.newProfilePic;

      const { error } = await supabase.from('users').update(updates).eq('id', currentUser.id);

      if(!error) {
          const updatedUser = { ...currentUser, ...updates };
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
          setProfileUpdateRequests(prev => prev.filter(req => req !== request));
          return true;
      }
      return false;
  };

  const updateEmailSettings = async (settings: EmailSettings) => setEmailSettings(settings);
  const updateSubscriptionSettings = async (settings: SubscriptionSettings) => setSubscriptionSettings(settings);
  const updateAdSettings = async (settings: AdSettings) => setAdSettings(settings);

  const logout = () => {
    setCurrentUser(null);
  };

  const getAnalytics = (): AnalyticsData => {
      // Analytics derived from current articles state
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
              category,
              count,
              percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
              color: colors[index % colors.length]
          }))
          .sort((a, b) => b.count - a.count);

      const dailyVisits = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          if (totalViews === 0) return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), visits: 0 };
          const baseDaily = totalViews / 7; 
          const randomFactor = 0.5 + Math.random() * 1.0; 
          return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), visits: Math.round(baseDaily * randomFactor) };
      });

      const geoSources = totalViews === 0 ? [
          { country: 'United States', percentage: 0 }, { country: 'United Kingdom', percentage: 0 },
          { country: 'India', percentage: 0 }, { country: 'Canada', percentage: 0 },
          { country: 'Germany', percentage: 0 }, { country: 'Other', percentage: 0 },
      ] : [
          { country: 'United States', percentage: 42 }, { country: 'United Kingdom', percentage: 18 },
          { country: 'India', percentage: 12 }, { country: 'Canada', percentage: 8 },
          { country: 'Germany', percentage: 7 }, { country: 'Other', percentage: 13 },
      ];

      return { totalViews, avgViewsPerArticle, categoryDistribution, dailyVisits, geoSources };
  };

  const addArticle = async (article: Article) => {
    if(!supabase) return;
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? article.status : 'pending';
    const newArticle = { ...article, status };
    
    const { error } = await supabase.from('articles').insert([newArticle]);
    if(!error) setArticles(prev => [newArticle, ...prev]);
  };

  const updateArticle = async (updatedArticle: Article) => {
    if(!supabase) return;
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? updatedArticle.status : 'pending';
    const finalArticle = { ...updatedArticle, status };
    
    const { error } = await supabase.from('articles').update(finalArticle).eq('id', finalArticle.id);
    if(!error) setArticles(prev => prev.map(a => a.id === finalArticle.id ? finalArticle : a));
  };

  const deleteArticle = async (id: string) => {
    if(!supabase) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if(!error) setArticles(prev => prev.filter(a => a.id !== id));
  };

  const incrementArticleView = async (id: string) => {
    if(!supabase) return;
    const article = articles.find(a => a.id === id);
    if(article) {
        const newViews = (article.views || 0) + 1;
        // Optimistic update
        setArticles(prev => prev.map(a => a.id === id ? { ...a, views: newViews } : a));
        // DB update
        await supabase.from('articles').update({ views: newViews }).eq('id', id);
    }
  };

  const addCategory = async (category: string) => {
      if (category.trim() && !categories.includes(category.trim())) {
          setCategories(prev => [...prev, category.trim()]);
          // Categories stored in localStorage or hardcoded for now, could move to DB table
      }
  };

  const deleteCategory = async (category: string) => {
      setCategories(prev => prev.filter(c => c !== category));
  };

  const addEPaperPage = async (page: EPaperPage) => {
    if(!supabase) return;
    const status: 'active' | 'pending' = currentUser?.id === CHIEF_EDITOR_ID ? 'active' : 'pending';
    const newPage = { ...page, status };
    const { error } = await supabase.from('epaper_pages').insert([newPage]);
    if(!error) setEPaperPages(prev => [...prev, newPage]);
  };

  const deleteEPaperPage = async (id: string) => {
    if(!supabase) return;
    const { error } = await supabase.from('epaper_pages').delete().eq('id', id);
    if(!error) setEPaperPages(prev => prev.filter(p => p.id !== id));
  };

  const deleteAllEPaperPages = async () => {
    if(!supabase) return;
    const { error } = await supabase.from('epaper_pages').delete().neq('id', '0'); // Delete all
    if(!error) setEPaperPages([]);
  };

  const addClipping = async (clipping: Clipping) => {
    if(!supabase) return;
    const finalClipping = { ...clipping, userId: currentUser?.id };
    const { error } = await supabase.from('clippings').insert([finalClipping]);
    if(!error) setClippings(prev => [finalClipping, ...prev]);
  };

  const deleteClipping = async (id: string) => {
    if(!supabase) return;
    const { error } = await supabase.from('clippings').delete().eq('id', id);
    if(!error) setClippings(prev => prev.filter(c => c.id !== id));
  };

  const deleteUser = async (id: string) => {
    if(!supabase) return;
    if (id === CHIEF_EDITOR_ID) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if(!error) setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserStatus = async (id: string) => {
    if(!supabase) return;
    if (id === CHIEF_EDITOR_ID) return;
    const user = users.find(u => u.id === id);
    if(user) {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
        if(!error) setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    }
  };

  const toggleUserSubscription = async (id: string) => {
      if(!supabase) return;
      const user = users.find(u => u.id === id);
      if(user) {
          const newPlan = user.subscriptionPlan === 'premium' ? 'free' : 'premium';
          const isAdFree = newPlan === 'premium';
          
          const { error } = await supabase.from('users').update({ subscriptionPlan: newPlan, isAdFree }).eq('id', id);
          
          if(!error) {
              setUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionPlan: newPlan, isAdFree } : u));
              if (currentUser?.id === id) {
                  setCurrentUser(prev => prev ? ({ ...prev, subscriptionPlan: newPlan, isAdFree }) : null);
              }
          }
      }
  };
  
  const toggleUserAdStatus = async (id: string) => {
      if(!supabase) return;
      const user = users.find(u => u.id === id);
      if(user) {
          const newStatus = !user.isAdFree;
          const { error } = await supabase.from('users').update({ isAdFree: newStatus }).eq('id', id);
          if(!error) {
              setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdFree: newStatus } : u));
              if (currentUser?.id === id) setCurrentUser(prev => prev ? ({ ...prev, isAdFree: newStatus }) : null);
          }
      }
  };

  const addAdvertisement = async (ad: Advertisement) => {
      if(!supabase) return;
      const status = currentUser?.id === CHIEF_EDITOR_ID ? ad.status : 'pending';
      const newAd = { ...ad, status };
      const { error } = await supabase.from('advertisements').insert([newAd]);
      if(!error) setAdvertisements(prev => [...prev, newAd]);
  };

  const updateAdvertisement = async (updatedAd: Advertisement) => {
      if(!supabase) return;
      const status = currentUser?.id === CHIEF_EDITOR_ID ? updatedAd.status : 'pending';
      const finalAd = { ...updatedAd, status };
      const { error } = await supabase.from('advertisements').update(finalAd).eq('id', finalAd.id);
      if(!error) setAdvertisements(prev => prev.map(a => a.id === updatedAd.id ? finalAd : a));
  };

  const deleteAdvertisement = async (id: string) => {
      if(!supabase) return;
      const { error } = await supabase.from('advertisements').delete().eq('id', id);
      if(!error) setAdvertisements(prev => prev.filter(a => a.id !== id));
  };

  const toggleAdStatus = async (id: string) => {
      if(!supabase) return;
      const ad = advertisements.find(a => a.id === id);
      if(ad) {
          const newStatus = ad.status === 'active' ? 'inactive' : 'active';
          const { error } = await supabase.from('advertisements').update({ status: newStatus }).eq('id', id);
          if(!error) setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
  };

  const trackAdClick = async (id: string) => {
      if(!supabase) return;
      const ad = advertisements.find(a => a.id === id);
      if (ad && !ad.clickedIps.includes(visitorIp)) {
          const newClicks = (ad.clicks || 0) + 1;
          const newIps = [...ad.clickedIps, visitorIp];
          const { error } = await supabase.from('advertisements').update({ clicks: newClicks, clickedIps: newIps }).eq('id', id);
          
          if(!error) {
              setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, clicks: newClicks, clickedIps: newIps } : a));
          }
      }
  };

  const updateWatermarkSettings = async (settings: WatermarkSettings) => setWatermarkSettings(settings);

  const approveContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if(!supabase) return;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;
      
      if (type === 'article') {
          const { error } = await supabase.from('articles').update({ status: 'published' }).eq('id', id);
          if(!error) setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'published' } : a));
      }
      if (type === 'ad') {
          const { error } = await supabase.from('advertisements').update({ status: 'active' }).eq('id', id);
          if(!error) setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
      }
      if (type === 'epaper') {
          const { error } = await supabase.from('epaper_pages').update({ status: 'active' }).eq('id', id);
          if(!error) setEPaperPages(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
      }
  };

  const rejectContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if(!supabase) return;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;

      if (type === 'article') {
          const { error } = await supabase.from('articles').update({ status: 'draft' }).eq('id', id);
          if(!error) setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'draft' } : a));
      }
      if (type === 'ad') {
          const { error } = await supabase.from('advertisements').update({ status: 'inactive' }).eq('id', id);
          if(!error) setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: 'inactive' } : a));
      }
      if (type === 'epaper') {
          const { error } = await supabase.from('epaper_pages').delete().eq('id', id);
          if(!error) setEPaperPages(prev => prev.filter(p => p.id !== id));
      }
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
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: []
      };
      
      const { error } = await supabase.from('comments').insert([newComment]);
      if(!error) setComments(prev => [newComment, ...prev]);
  };

  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
      if (!currentUser || !supabase) return; 
      const userId = currentUser.id;
      const comment = comments.find(c => c.id === commentId);
      if(!comment) return;
      
      const hasLiked = comment.likedBy.includes(userId);
      const hasDisliked = comment.dislikedBy.includes(userId);
      
      let newLikes = comment.likes;
      let newDislikes = comment.dislikes;
      let newLikedBy = [...comment.likedBy];
      let newDislikedBy = [...comment.dislikedBy];

      if (type === 'like') {
          if (hasLiked) {
              newLikes--;
              newLikedBy = newLikedBy.filter(id => id !== userId);
          } else {
              newLikes++;
              newLikedBy.push(userId);
              if (hasDisliked) {
                  newDislikes--;
                  newDislikedBy = newDislikedBy.filter(id => id !== userId);
              }
          }
      } else {
          if (hasDisliked) {
              newDislikes--;
              newDislikedBy = newDislikedBy.filter(id => id !== userId);
          } else {
              newDislikes++;
              newDislikedBy.push(userId);
              if (hasLiked) {
                  newLikes--;
                  newLikedBy = newLikedBy.filter(id => id !== userId);
              }
          }
      }

      const { error } = await supabase.from('comments').update({ 
          likes: newLikes, dislikes: newDislikes, likedBy: newLikedBy, dislikedBy: newDislikedBy 
      }).eq('id', commentId);

      if(!error) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: newLikes, dislikes: newDislikes, likedBy: newLikedBy, dislikedBy: newDislikedBy } : c));
      }
  };

  const deleteComment = async (commentId: string) => {
      if(!supabase) return;
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if(!error) setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
      if(!supabase) return;
      const newMessage: ContactMessage = {
          id: Date.now().toString(),
          name,
          email,
          subject,
          message,
          timestamp: Date.now(),
          read: false
      };
      const { error } = await supabase.from('messages').insert([newMessage]);
      if(!error) setContactMessages(prev => [newMessage, ...prev]);
  };

  const markMessageAsRead = async (id: string) => {
      if(!supabase) return;
      const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
      if(!error) setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
  };

  const deleteMessage = async (id: string) => {
      if(!supabase) return;
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if(!error) setContactMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const addClassified = async (classified: Classified) => {
      if(!supabase) return;
      const { error } = await supabase.from('classifieds').insert([classified]);
      if(!error) setClassifieds(prev => [classified, ...prev]);
  };

  const deleteClassified = async (id: string) => {
      if(!supabase) return;
      const { error } = await supabase.from('classifieds').delete().eq('id', id);
      if(!error) setClassifieds(prev => prev.filter(c => c.id !== id));
  };

  return (
    <NewsContext.Provider value={{
      articles,
      categories,
      ePaperPages,
      clippings,
      currentUser,
      users,
      advertisements,
      watermarkSettings,
      recoveryRequests,
      emailSettings,
      subscriptionSettings,
      adSettings,
      comments,
      contactMessages,
      classifieds,
      login,
      register,
      createAdmin,
      logout,
      resetPassword,
      initiateRecovery,
      completeRecovery,
      initiateProfileUpdate,
      completeProfileUpdate,
      updateEmailSettings,
      updateSubscriptionSettings,
      updateAdSettings,
      getAnalytics,
      addArticle,
      updateArticle,
      deleteArticle,
      incrementArticleView,
      addCategory,
      deleteCategory,
      addEPaperPage,
      deleteEPaperPage,
      deleteAllEPaperPages,
      addClipping,
      deleteClipping,
      deleteUser,
      toggleUserStatus,
      toggleUserSubscription,
      toggleUserAdStatus,
      addAdvertisement,
      updateAdvertisement,
      deleteAdvertisement,
      toggleAdStatus,
      trackAdClick,
      updateWatermarkSettings,
      approveContent,
      rejectContent,
      addComment,
      voteComment,
      deleteComment,
      sendContactMessage,
      markMessageAsRead,
      deleteMessage,
      addClassified,
      deleteClassified
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
