
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article, EPaperPage, Clipping, User, UserRole, Advertisement, WatermarkSettings, RecoveryRequest, ProfileUpdateRequest, EmailSettings, SubscriptionSettings, AdSettings, AnalyticsData, Comment, ContactMessage, Classified } from '../types';
import { CHIEF_EDITOR_ID, MASTER_RECOVERY_KEY, DEFAULT_EMAIL_SETTINGS, DEFAULT_SUBSCRIPTION_SETTINGS, DEFAULT_AD_SETTINGS, INITIAL_ARTICLES, INITIAL_USERS, INITIAL_EPAPER_PAGES, INITIAL_ADS, INITIAL_CLASSIFIEDS } from '../constants';

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
  addClipping: (clipping: Clipping) => Promise<void>;
  deleteClipping: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  toggleUserSubscription: (id: string) => Promise<void>; 
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
  // Initialize state with Lazy Initializers to load from LocalStorage
  const [articles, setArticles] = useState<Article[]>(() => {
      const saved = localStorage.getItem('cj_articles');
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [categories, setCategories] = useState<string[]>(() => {
      const saved = localStorage.getItem('cj_categories');
      return saved ? JSON.parse(saved) : ['World', 'Business', 'Technology', 'Culture', 'Sports', 'Opinion'];
  });

  const [ePaperPages, setEPaperPages] = useState<EPaperPage[]>(() => {
      const saved = localStorage.getItem('cj_epaper');
      return saved ? JSON.parse(saved) : INITIAL_EPAPER_PAGES;
  });

  const [clippings, setClippings] = useState<Clipping[]>(() => {
      const saved = localStorage.getItem('cj_clippings');
      return saved ? JSON.parse(saved) : [];
  });
  
  const [users, setUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('cj_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('cj_current_user');
      return saved ? JSON.parse(saved) : null;
  });

  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
      const saved = localStorage.getItem('cj_ads');
      return saved ? JSON.parse(saved) : INITIAL_ADS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
      const saved = localStorage.getItem('cj_comments');
      return saved ? JSON.parse(saved) : [];
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
      const saved = localStorage.getItem('cj_messages');
      return saved ? JSON.parse(saved) : [];
  });

  const [classifieds, setClassifieds] = useState<Classified[]>(() => {
      const saved = localStorage.getItem('cj_classifieds');
      return saved ? JSON.parse(saved) : INITIAL_CLASSIFIEDS;
  });

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

  // Temporary State (not persisted)
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [profileUpdateRequests, setProfileUpdateRequests] = useState<ProfileUpdateRequest[]>([]);
  const [visitorIp, setVisitorIp] = useState<string>('');

  useEffect(() => {
    let ip = localStorage.getItem('cj_visitor_ip');
    if (!ip) {
       ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
       localStorage.setItem('cj_visitor_ip', ip);
    }
    setVisitorIp(ip);
  }, []);

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('cj_articles', JSON.stringify(articles)), [articles]);
  useEffect(() => localStorage.setItem('cj_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('cj_epaper', JSON.stringify(ePaperPages)), [ePaperPages]);
  useEffect(() => localStorage.setItem('cj_clippings', JSON.stringify(clippings)), [clippings]);
  useEffect(() => localStorage.setItem('cj_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('cj_ads', JSON.stringify(advertisements)), [advertisements]);
  useEffect(() => localStorage.setItem('cj_comments', JSON.stringify(comments)), [comments]);
  useEffect(() => localStorage.setItem('cj_messages', JSON.stringify(contactMessages)), [contactMessages]);
  useEffect(() => localStorage.setItem('cj_classifieds', JSON.stringify(classifieds)), [classifieds]);
  
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


  // --- Functions ---

  const login = async (email: string, password: string, role?: UserRole): Promise<User | null> => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (role && user.role !== role) return null;
      if (user.status === 'blocked' || user.status === 'pending') return null;
      
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'publisher'): Promise<{ success: boolean; message?: string }> => {
    if (users.find(u => u.email === email)) {
        return { success: false, message: "Email already registered." };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: role, 
      status: role === 'publisher' ? 'pending' : 'active',
      ip: visitorIp,
      joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      subscriptionPlan: role === 'subscriber' ? 'free' : undefined,
      profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
    };

    setUsers(prev => [...prev, newUser]);
    if (newUser.status === 'active' && !currentUser) {
        setCurrentUser(newUser);
    }
    return { success: true };
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      if (currentUser?.id !== CHIEF_EDITOR_ID) return false;
      if (users.find(u => u.email === email)) return false;

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
      setUsers(prev => [...prev, newAdmin]);
      return true;
  };

  const resetPassword = async (identifier: string, newPassword: string): Promise<boolean> => {
      const userIndex = users.findIndex(u => u.email === identifier || u.name === identifier);
      if (userIndex === -1) return false;

      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
      setUsers(updatedUsers);
      return true;
  };

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
      if (!currentUser) return false;
      const request = profileUpdateRequests.find(req => req.userId === currentUser.id && req.verificationCode === code);
      if (!request) return false;

      const updatedUser = { 
          ...currentUser, 
          email: request.newEmail || currentUser.email,
          password: request.newPassword || currentUser.password,
          profilePicUrl: request.newProfilePic || currentUser.profilePicUrl
      };

      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      setProfileUpdateRequests(prev => prev.filter(req => req !== request));
      return true;
  };

  const updateEmailSettings = async (settings: EmailSettings) => setEmailSettings(settings);
  const updateSubscriptionSettings = async (settings: SubscriptionSettings) => setSubscriptionSettings(settings);
  const updateAdSettings = async (settings: AdSettings) => setAdSettings(settings);

  const logout = () => {
    setCurrentUser(null);
  };

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
              category,
              count,
              percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
              color: colors[index % colors.length]
          }))
          .sort((a, b) => b.count - a.count);

      const dailyVisits = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const baseDaily = totalViews / 30; 
          const randomFactor = 0.8 + Math.random() * 0.4; 
          return {
              date: d.toLocaleDateString('en-US', { weekday: 'short' }),
              visits: Math.max(10, Math.round(baseDaily * randomFactor))
          };
      });

      const geoSources = [
          { country: 'United States', percentage: 42 },
          { country: 'United Kingdom', percentage: 18 },
          { country: 'India', percentage: 12 },
          { country: 'Canada', percentage: 8 },
          { country: 'Germany', percentage: 7 },
          { country: 'Other', percentage: 13 },
      ];

      return {
          totalViews,
          avgViewsPerArticle,
          categoryDistribution,
          dailyVisits,
          geoSources
      };
  };

  const addArticle = async (article: Article) => {
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? article.status : 'pending';
    const newArticle = { ...article, status };
    setArticles(prev => [newArticle, ...prev]);
  };

  const updateArticle = async (updatedArticle: Article) => {
    const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'publisher';
    const status = canPublish ? updatedArticle.status : 'pending';
    const finalArticle = { ...updatedArticle, status };
    setArticles(prev => prev.map(a => a.id === finalArticle.id ? finalArticle : a));
  };

  const deleteArticle = async (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const incrementArticleView = async (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, views: (a.views || 0) + 1 } : a));
  };

  const addCategory = async (category: string) => {
      if (category.trim() && !categories.includes(category.trim())) {
          setCategories(prev => [...prev, category.trim()]);
      }
  };

  const deleteCategory = async (category: string) => {
      setCategories(prev => prev.filter(c => c !== category));
  };

  const addEPaperPage = async (page: EPaperPage) => {
    const status: 'active' | 'pending' = currentUser?.id === CHIEF_EDITOR_ID ? 'active' : 'pending';
    setEPaperPages(prev => [...prev, { ...page, status }]);
  };

  const deleteEPaperPage = async (id: string) => {
    setEPaperPages(prev => prev.filter(p => p.id !== id));
  };

  const addClipping = async (clipping: Clipping) => {
    const finalClipping = { ...clipping, userId: currentUser?.id };
    setClippings(prev => [finalClipping, ...prev]);
  };

  const deleteClipping = async (id: string) => {
    setClippings(prev => prev.filter(c => c.id !== id));
  };

  const deleteUser = async (id: string) => {
    if (id === CHIEF_EDITOR_ID) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserStatus = async (id: string) => {
    if (id === CHIEF_EDITOR_ID) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
  };

  const toggleUserSubscription = async (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionPlan: u.subscriptionPlan === 'premium' ? 'free' : 'premium' } : u));
      if (currentUser?.id === id) {
          setCurrentUser(prev => prev ? ({ ...prev, subscriptionPlan: prev.subscriptionPlan === 'premium' ? 'free' : 'premium' }) : null);
      }
  };

  const addAdvertisement = async (ad: Advertisement) => {
      const status = currentUser?.id === CHIEF_EDITOR_ID ? ad.status : 'pending';
      setAdvertisements(prev => [...prev, { ...ad, status }]);
  };

  const updateAdvertisement = async (updatedAd: Advertisement) => {
      const status = currentUser?.id === CHIEF_EDITOR_ID ? updatedAd.status : 'pending';
      setAdvertisements(prev => prev.map(a => a.id === updatedAd.id ? { ...updatedAd, status } : a));
  };

  const deleteAdvertisement = async (id: string) => {
      setAdvertisements(prev => prev.filter(a => a.id !== id));
  };

  const toggleAdStatus = async (id: string) => {
      setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a));
  };

  const trackAdClick = async (id: string) => {
      setAdvertisements(prev => prev.map(a => {
          if (a.id === id && !a.clickedIps.includes(visitorIp)) {
              return { ...a, clicks: (a.clicks || 0) + 1, clickedIps: [...a.clickedIps, visitorIp] };
          }
          return a;
      }));
  };

  const updateWatermarkSettings = async (settings: WatermarkSettings) => setWatermarkSettings(settings);

  const approveContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;
      if (type === 'article') setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'published' } : a));
      if (type === 'ad') setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
      if (type === 'epaper') setEPaperPages(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
  };

  const rejectContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      if (currentUser?.id !== CHIEF_EDITOR_ID) return;
      if (type === 'article') setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'draft' } : a));
      if (type === 'ad') setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: 'inactive' } : a));
      if (type === 'epaper') setEPaperPages(prev => prev.filter(p => p.id !== id));
  };

  const addComment = async (articleId: string, content: string) => {
      if (!currentUser) return;
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
      setComments(prev => [newComment, ...prev]);
  };

  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
      if (!currentUser) return; 
      const userId = currentUser.id;
      
      setComments(prev => prev.map(c => {
          if (c.id !== commentId) return c;

          const hasLiked = c.likedBy.includes(userId);
          const hasDisliked = c.dislikedBy.includes(userId);
          
          let newLikes = c.likes;
          let newDislikes = c.dislikes;
          let newLikedBy = [...c.likedBy];
          let newDislikedBy = [...c.dislikedBy];

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
          return { ...c, likes: newLikes, dislikes: newDislikes, likedBy: newLikedBy, dislikedBy: newDislikedBy };
      }));
  };

  const deleteComment = async (commentId: string) => {
      setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
      const newMessage: ContactMessage = {
          id: Date.now().toString(),
          name,
          email,
          subject,
          message,
          timestamp: Date.now(),
          read: false
      };
      setContactMessages(prev => [newMessage, ...prev]);
  };

  const markMessageAsRead = async (id: string) => {
      setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
  };

  const deleteMessage = async (id: string) => {
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const addClassified = async (classified: Classified) => {
      setClassifieds(prev => [classified, ...prev]);
  };

  const deleteClassified = async (id: string) => {
      setClassifieds(prev => prev.filter(c => c.id !== id));
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
      addClipping,
      deleteClipping,
      deleteUser,
      toggleUserStatus,
      toggleUserSubscription,
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
