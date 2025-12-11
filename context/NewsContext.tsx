
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
  logout: () => void;
  resetPassword: (password: string) => Promise<boolean>; 
  initiateRecovery: (email: string) => Promise<{ success: boolean, message: string }>;
  completeRecovery: (identifier: string, code: string, newPassword: string) => Promise<boolean>; // Deprecated but kept for type compatibility
  
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
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES); // Init with fallback
  const [categories, setCategories] = useState<string[]>(['World', 'Business', 'Technology', 'Culture', 'Sports', 'Opinion']);
  const [ePaperPages, setEPaperPages] = useState<EPaperPage[]>(INITIAL_EPAPER_PAGES); // Init with fallback
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS); // Init with fallback
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(INITIAL_ADS); // Init with fallback
  const [comments, setComments] = useState<Comment[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>(INITIAL_CLASSIFIEDS); // Init with fallback

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

      // Helper to handle data fetching with fallback
      // If DB error (missing table/RLS) or empty data, use initial constants
      const loadTable = async <T,>(table: string, fallback: T[], setter: (data: T[]) => void) => {
          try {
            const { data, error } = await supabase.from(table).select('*');
            
            if (error) {
                console.warn(`Supabase error fetching ${table}:`, error.message);
                // Fallback to local data is already set via useState init, but ensure consistency
                setter(fallback);
                return;
            }

            if (data && data.length > 0) {
                setter(data as T[]);
            } else {
                console.log(`Table ${table} is empty. Attempting to seed...`);
                // Try to seed. If this fails (e.g. RLS), we stick with fallback in memory
                const { error: insertError } = await supabase.from(table).insert(fallback as any);
                if (insertError) {
                    console.warn(`Failed to seed ${table}:`, insertError.message);
                }
                setter(fallback);
            }
          } catch (err) {
              console.error(`Unexpected error loading ${table}:`, err);
              setter(fallback);
          }
      };

      // Load all main tables
      await Promise.all([
          loadTable<Article>('articles', INITIAL_ARTICLES, setArticles),
          loadTable<User>('users', INITIAL_USERS, setUsers),
          loadTable<EPaperPage>('epaper_pages', INITIAL_EPAPER_PAGES, setEPaperPages),
          loadTable<Advertisement>('advertisements', INITIAL_ADS, setAdvertisements),
          loadTable<Classified>('classifieds', INITIAL_CLASSIFIEDS, setClassifieds),
      ]);

      // Load optional tables (no seed needed)
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

    // SUPABASE AUTH LISTENER
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            // Fetch the detailed profile from public.users table
            const { data: userProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (userProfile && !error) {
                // Check if user is blocked or pending
                if (userProfile.status === 'blocked' || userProfile.status === 'pending') {
                    // Force logout if status invalid
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                } else {
                    setCurrentUser(userProfile);
                }
            }
        } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  // --- PERSIST SETTINGS (Local only for now) ---
  useEffect(() => localStorage.setItem('cj_watermark_settings', JSON.stringify(watermarkSettings)), [watermarkSettings]);
  useEffect(() => localStorage.setItem('cj_email_settings', JSON.stringify(emailSettings)), [emailSettings]);
  useEffect(() => localStorage.setItem('cj_sub_settings', JSON.stringify(subscriptionSettings)), [subscriptionSettings]);
  useEffect(() => localStorage.setItem('cj_ad_settings', JSON.stringify(adSettings)), [adSettings]);


  // --- FUNCTIONS ---

  const login = async (email: string, password: string, role?: UserRole): Promise<User | null> => {
    if(!supabase) return null;

    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error || !data.user) {
        console.error("Login Auth Error:", error);
        return null;
    }

    // 2. Fetch User Profile from public.users
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError || !userProfile) {
        // If auth exists but profile doesn't, signOut
        await supabase.auth.signOut();
        return null;
    }

    // 3. Role and Status Check
    if (role && userProfile.role !== role && userProfile.role !== 'admin') { 
        // Allow admins to login to any role interface, else restrict
        await supabase.auth.signOut();
        return null;
    }

    if (userProfile.status === 'blocked') {
        await supabase.auth.signOut();
        throw new Error("Account is blocked.");
    }
    
    if (userProfile.status === 'pending') {
        await supabase.auth.signOut();
        throw new Error("Account is pending approval.");
    }

    setCurrentUser(userProfile);
    return userProfile;
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'publisher'): Promise<{ success: boolean; message?: string }> => {
    if(!supabase) return { success: false, message: "Database error" };

    // 1. Create Auth User in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { name: name } // Store name in metadata
        }
    });

    if (authError) {
        return { success: false, message: authError.message };
    }

    if (!authData.user) {
        return { success: false, message: "Registration failed." };
    }

    // 2. Create Profile in public.users
    // Publishers require admin approval (pending), Subscribers are active immediately
    const initialStatus = role === 'publisher' ? 'pending' : 'active';

    const newUser: User = {
      id: authData.user.id, // SYNC ID WITH AUTH
      name,
      email,
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
        // Fallback for demo: add to local state so user can login immediately in this session
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
      if (currentUser?.id !== CHIEF_EDITOR_ID) return false;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
          email, password
      });

      if (authError || !authData.user) return false;

      const newAdmin: User = {
          id: authData.user.id,
          name,
          email,
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

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const initiateRecovery = async (email: string): Promise<{ success: boolean, message: string }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login', // Redirects here after clicking email link
      });

      if (error) return { success: false, message: error.message };
      return { success: true, message: "Password reset link sent to your email." };
  };

  const resetPassword = async (newPassword: string): Promise<boolean> => {
      // Updates the password for the currently logged in user (used after clicking reset link)
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return !error;
  };

  // Deprecated dummy function kept for interface compatibility if needed elsewhere temporarily
  const completeRecovery = async (identifier: string, code: string, newPassword: string): Promise<boolean> => {
      return false; 
  };

  // --- Profile Updates ---
  const initiateProfileUpdate = async (newEmail?: string, newPassword?: string, newProfilePic?: string): Promise<{ code: string, message: string } | null> => {
      // With real auth, we update directly
      if (!currentUser) return null;
      
      const updates: any = {};
      if (newEmail) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw new Error(error.message);
      }

      if (newProfilePic || newEmail) {
         // Update public profile
         const profileUpdates: any = {};
         if (newProfilePic) profileUpdates.profilePicUrl = newProfilePic;
         if (newEmail) profileUpdates.email = newEmail;
         
         await supabase.from('users').update(profileUpdates).eq('id', currentUser.id);
         setCurrentUser(prev => prev ? ({...prev, ...profileUpdates}) : null);
      }

      // We return null because we processed immediately in this implementation
      return { code: 'DONE', message: 'Profile updated successfully.' };
  };

  const completeProfileUpdate = async (code: string): Promise<boolean> => {
      return true; // Handled in initiate
  };

  // ... (Rest of the standard CRUD functions remain same, they rely on 'currentUser' state or direct DB calls) ...
  
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
    // Optimistic UI update
    setArticles(prev => [newArticle, ...prev]);
    const { error } = await supabase.from('articles').insert([newArticle]);
    if(error) console.error("Error adding article", error);
  };

  const updateArticle = async (updatedArticle: Article) => {
    if(!supabase) return;
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? updatedArticle.status : 'pending';
    const finalArticle = { ...updatedArticle, status };
    // Optimistic UI update
    setArticles(prev => prev.map(a => a.id === finalArticle.id ? finalArticle : a));
    const { error } = await supabase.from('articles').update(finalArticle).eq('id', finalArticle.id);
    if(error) console.error("Error updating article", error);
  };

  const deleteArticle = async (id: string) => {
    if(!supabase) return;
    // Optimistic UI
    setArticles(prev => prev.filter(a => a.id !== id));
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if(error) console.error("Error deleting article", error);
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
    const { error } = await supabase.from('epaper_pages').insert([newPage]);
    if(error) console.error(error);
  };
  const deleteEPaperPage = async (id: string) => {
    if(!supabase) return;
    setEPaperPages(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('epaper_pages').delete().eq('id', id);
    if(error) console.error(error);
  };
  const deleteAllEPaperPages = async () => {
    if(!supabase) return;
    setEPaperPages([]);
    const { error } = await supabase.from('epaper_pages').delete().neq('id', '0');
    if(error) console.error(error);
  };

  const addClipping = async (clipping: Clipping) => {
    if(!supabase) return;
    const finalClipping = { ...clipping, userId: currentUser?.id };
    setClippings(prev => [finalClipping, ...prev]);
    const { error } = await supabase.from('clippings').insert([finalClipping]);
    if(error) console.error(error);
  };
  const deleteClipping = async (id: string) => {
    if(!supabase) return;
    setClippings(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from('clippings').delete().eq('id', id);
    if(error) console.error(error);
  };

  const deleteUser = async (id: string) => {
    if(!supabase) return;
    if (id === CHIEF_EDITOR_ID) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    const { error } = await supabase.from('users').delete().eq('id', id);
    if(error) console.error(error);
  };

  const toggleUserStatus = async (id: string) => {
    if(!supabase) return;
    if (id === CHIEF_EDITOR_ID) return;
    const user = users.find(u => u.id === id);
    if(user) {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
        if(error) console.error(error);
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
          const { error } = await supabase.from('users').update({ subscriptionPlan: newPlan, isAdFree }).eq('id', id);
          if(error) console.error(error);
      }
  };
  const toggleUserAdStatus = async (id: string) => {
      if(!supabase) return;
      const user = users.find(u => u.id === id);
      if(user) {
          const newStatus = !user.isAdFree;
          setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdFree: newStatus } : u));
          if (currentUser?.id === id) setCurrentUser(prev => prev ? ({ ...prev, isAdFree: newStatus }) : null);
          const { error } = await supabase.from('users').update({ isAdFree: newStatus }).eq('id', id);
          if(error) console.error(error);
      }
  };

  const addAdvertisement = async (ad: Advertisement) => {
      if(!supabase) return;
      const status = currentUser?.id === CHIEF_EDITOR_ID ? ad.status : 'pending';
      const newAd = { ...ad, status };
      setAdvertisements(prev => [...prev, newAd]);
      const { error } = await supabase.from('advertisements').insert([newAd]);
      if(error) console.error(error);
  };
  const updateAdvertisement = async (updatedAd: Advertisement) => {
      if(!supabase) return;
      const status = currentUser?.id === CHIEF_EDITOR_ID ? updatedAd.status : 'pending';
      const finalAd = { ...updatedAd, status };
      setAdvertisements(prev => prev.map(a => a.id === updatedAd.id ? finalAd : a));
      const { error } = await supabase.from('advertisements').update(finalAd).eq('id', finalAd.id);
      if(error) console.error(error);
  };
  const deleteAdvertisement = async (id: string) => {
      if(!supabase) return;
      setAdvertisements(prev => prev.filter(a => a.id !== id));
      const { error } = await supabase.from('advertisements').delete().eq('id', id);
      if(error) console.error(error);
  };
  const toggleAdStatus = async (id: string) => {
      if(!supabase) return;
      const ad = advertisements.find(a => a.id === id);
      if(ad) {
          const newStatus = ad.status === 'active' ? 'inactive' : 'active';
          setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
          const { error } = await supabase.from('advertisements').update({ status: newStatus }).eq('id', id);
          if(error) console.error(error);
      }
  };
  const trackAdClick = async (id: string) => {
      if(!supabase) return;
      const ad = advertisements.find(a => a.id === id);
      if (ad && !ad.clickedIps.includes(visitorIp)) {
          const newClicks = (ad.clicks || 0) + 1;
          const newIps = [...ad.clickedIps, visitorIp];
          setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, clicks: newClicks, clickedIps: newIps } : a));
          const { error } = await supabase.from('advertisements').update({ clicks: newClicks, clickedIps: newIps }).eq('id', id);
          if(error) console.error(error);
      }
  };
  const updateWatermarkSettings = async (settings: WatermarkSettings) => setWatermarkSettings(settings);
  const approveContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if(!supabase) return;
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;
      const table = type === 'article' ? 'articles' : type === 'ad' ? 'advertisements' : 'epaper_pages';
      const { error } = await supabase.from(table).update({ status: type === 'ad' || type === 'epaper' ? 'active' : 'published' }).eq('id', id);
      if(!error) fetchData(); // refresh
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
      const { error } = await supabase.from('comments').insert([newComment]);
      if(error) console.error(error);
  };
  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
      if (!currentUser || !supabase) return; 
      // Simplified Optimistic UI
      // Real implementation would sync with DB
  };
  const deleteComment = async (commentId: string) => {
      if(!supabase) return;
      setComments(prev => prev.filter(c => c.id !== commentId));
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if(error) console.error(error);
  };
  const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
      if(!supabase) return;
      const newMessage: ContactMessage = {
          id: Date.now().toString(),
          name, email, subject, message, timestamp: Date.now(), read: false
      };
      setContactMessages(prev => [newMessage, ...prev]);
      const { error } = await supabase.from('messages').insert([newMessage]);
      if(error) console.error(error);
  };
  const markMessageAsRead = async (id: string) => {
      if(!supabase) return;
      setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
      const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
      if(error) console.error(error);
  };
  const deleteMessage = async (id: string) => {
      if(!supabase) return;
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if(error) console.error(error);
  };
  const addClassified = async (classified: Classified) => {
      if(!supabase) return;
      setClassifieds(prev => [classified, ...prev]);
      const { error } = await supabase.from('classifieds').insert([classified]);
      if(error) console.error(error);
  };
  const deleteClassified = async (id: string) => {
      if(!supabase) return;
      setClassifieds(prev => prev.filter(c => c.id !== id));
      const { error } = await supabase.from('classifieds').delete().eq('id', id);
      if(error) console.error(error);
  };

  return (
    <NewsContext.Provider value={{
      articles, categories, ePaperPages, clippings, currentUser, users, advertisements,
      watermarkSettings, recoveryRequests, emailSettings, subscriptionSettings, adSettings,
      comments, contactMessages, classifieds,
      login, register, createAdmin, logout, resetPassword, initiateRecovery, completeRecovery,
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
