
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Article, EPaperPage, Clipping, User, UserRole, Advertisement, WatermarkSettings, RecoveryRequest, ProfileUpdateRequest, EmailSettings, SubscriptionSettings, AdSettings, AnalyticsData, Comment, ContactMessage, Classified, SecurityRequest } from '../types';
import { CHIEF_EDITOR_ID, DEFAULT_EMAIL_SETTINGS, DEFAULT_SUBSCRIPTION_SETTINGS, DEFAULT_AD_SETTINGS, INITIAL_ARTICLES, INITIAL_USERS, INITIAL_EPAPER_PAGES, INITIAL_ADS, INITIAL_CLASSIFIEDS, APPWRITE_CONFIG } from '../constants';
// Import Appwrite
import { account, databases, uniqueId, Query, ID } from '../lib/appwrite';

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

  // --- APPWRITE DATA LOAD ---
  const fetchData = async () => {
      console.log("Fetching data from Appwrite...");

      const loadCollection = async <T,>(collectionId: string, fallback: T[], setter: (data: T[]) => void) => {
          try {
            if(!APPWRITE_CONFIG.PROJECT_ID || APPWRITE_CONFIG.PROJECT_ID === 'YOUR_PROJECT_ID') {
                setter(fallback);
                return;
            }

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID,
                collectionId,
                [Query.limit(100)] 
            );
            
            if (response.documents.length > 0) {
                // Map Appwrite documents to our types (removing internal appwrite keys if needed)
                const mappedData = response.documents.map(doc => {
                    const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...rest } = doc;
                    return { id: $id, ...rest };
                });
                setter(mappedData as any as T[]);
            } else {
                setter(fallback);
            }
          } catch (err) {
              console.warn(`Error loading ${collectionId} from Appwrite, using fallback.`);
              setter(fallback);
          }
      };

      await Promise.all([
          loadCollection<Article>(APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES, INITIAL_ARTICLES, setArticles),
          loadCollection<User>(APPWRITE_CONFIG.COLLECTION_IDS.USERS, INITIAL_USERS, setUsers),
          loadCollection<EPaperPage>(APPWRITE_CONFIG.COLLECTION_IDS.EPAPER, INITIAL_EPAPER_PAGES, setEPaperPages),
          loadCollection<Advertisement>(APPWRITE_CONFIG.COLLECTION_IDS.ADS, INITIAL_ADS, setAdvertisements),
          loadCollection<Classified>(APPWRITE_CONFIG.COLLECTION_IDS.CLASSIFIEDS, INITIAL_CLASSIFIEDS, setClassifieds),
      ]);

      // Simple fetches for smaller tables
      loadCollection<Comment>(APPWRITE_CONFIG.COLLECTION_IDS.COMMENTS, [], setComments);
      loadCollection<ContactMessage>(APPWRITE_CONFIG.COLLECTION_IDS.MESSAGES, [], setContactMessages);
      loadCollection<Clipping>(APPWRITE_CONFIG.COLLECTION_IDS.CLIPPINGS, [], setClippings);
  };

  const fetchSettings = async () => {
      try {
          if(!APPWRITE_CONFIG.PROJECT_ID || APPWRITE_CONFIG.PROJECT_ID === 'YOUR_PROJECT_ID') return;

          const response = await databases.listDocuments(
              APPWRITE_CONFIG.DATABASE_ID,
              APPWRITE_CONFIG.COLLECTION_IDS.SETTINGS
          );
          
          if (response.documents) {
              response.documents.forEach((doc: any) => {
                  if (doc.key === 'watermark') {
                      setWatermarkSettings(doc.value);
                      localStorage.setItem('cj_watermark_settings', JSON.stringify(doc.value));
                  }
                  if (doc.key === 'email') {
                      setEmailSettings(doc.value);
                      localStorage.setItem('cj_email_settings', JSON.stringify(doc.value));
                  }
                  if (doc.key === 'subscription') {
                      setSubscriptionSettings(doc.value);
                      localStorage.setItem('cj_sub_settings', JSON.stringify(doc.value));
                  }
                  if (doc.key === 'ads') {
                      setAdSettings(doc.value);
                      localStorage.setItem('cj_ad_settings', JSON.stringify(doc.value));
                  }
              });
          }
      } catch (e) {
          console.warn("Settings sync skipped:", e);
      }
  };

  useEffect(() => {
    // 1. Setup Visitor IP
    let ip = localStorage.getItem('cj_visitor_ip');
    if (!ip) {
       ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
       localStorage.setItem('cj_visitor_ip', ip);
    }
    setVisitorIp(ip);

    // 2. Setup Device ID
    let dId = localStorage.getItem('cj_device_id');
    if (!dId) {
        dId = `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        localStorage.setItem('cj_device_id', dId);
    }
    setCurrentDeviceId(dId);

    fetchData();
    fetchSettings();

    // Check Appwrite Session
    const checkSession = async () => {
        try {
            const sessionUser = await account.get();
            // Find the full user profile from our 'users' collection to get Role
            const userProfile = await databases.getDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_IDS.USERS,
                sessionUser.$id
            );
            if(userProfile) {
                // Map to our User type
                const userObj: User = {
                    id: userProfile.$id,
                    name: userProfile.name,
                    email: userProfile.email,
                    role: userProfile.role,
                    status: userProfile.status,
                    ip: userProfile.ip,
                    joinedAt: userProfile.joinedAt,
                    subscriptionPlan: userProfile.subscriptionPlan,
                    isAdFree: userProfile.isAdFree,
                    profilePicUrl: userProfile.profilePicUrl,
                    trustedDevices: userProfile.trustedDevices
                };
                setCurrentUser(userObj);
            }
        } catch (e) {
            // Not logged in
            console.log("No active Appwrite session");
        }
    };
    checkSession();
  }, []);

  // --- HELPER FOR DB OPERATIONS ---
  const dbCreate = async (collectionId: string, data: any, id = uniqueId()) => {
      try {
          await databases.createDocument(APPWRITE_CONFIG.DATABASE_ID, collectionId, id, data);
          return true;
      } catch (e) {
          console.error(`Create failed in ${collectionId}`, e);
          return false;
      }
  };

  const dbUpdate = async (collectionId: string, id: string, data: any) => {
      try {
          await databases.updateDocument(APPWRITE_CONFIG.DATABASE_ID, collectionId, id, data);
          return true;
      } catch (e) {
          console.error(`Update failed in ${collectionId}`, e);
          return false;
      }
  };

  const dbDelete = async (collectionId: string, id: string) => {
      try {
          await databases.deleteDocument(APPWRITE_CONFIG.DATABASE_ID, collectionId, id);
          return true;
      } catch (e) {
          console.error(`Delete failed in ${collectionId}`, e);
          return false;
      }
  };

  // --- SECURITY & AUTH FUNCTIONS ---

  const requestAccess = async (email: string, password: string, type: 'login' | 'recovery'): Promise<{ success: boolean; message: string; requestId?: string }> => {
      // Find user locally for speed, verify with DB later
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // We can't verify password here without logging in via Appwrite, so we assume valid for this step
      // In a real flow, you'd login first then check device.
      if (!user) return { success: false, message: "User not found." };

      if (user.trustedDevices && user.trustedDevices.includes(currentDeviceId)) {
          return { success: true, message: "Device Verified." };
      }

      if (!user.trustedDevices || user.trustedDevices.length === 0) {
          // First device auto-trust
          const updatedTrusted = [currentDeviceId];
          const updatedUser = { ...user, trustedDevices: updatedTrusted };
          setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
          dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, user.id, { trustedDevices: updatedTrusted });
          return { success: true, message: "First device verified." };
      }

      const existingReq = securityRequests.find(r => r.userId === user.id && r.deviceId === currentDeviceId && r.status === 'pending');
      if (existingReq) {
          return { success: false, message: "Approval Pending", requestId: existingReq.id };
      }

      const newRequest: SecurityRequest = {
          id: uniqueId(),
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
      // Ideally save request to DB too
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

      if (action === 'approve') {
          const req = securityRequests.find(r => r.id === requestId);
          if (req) {
              const user = users.find(u => u.id === req.userId);
              if (user) {
                  const updatedTrusted = [...(user.trustedDevices || []), req.deviceId];
                  setUsers(prev => prev.map(u => u.id === user.id ? { ...u, trustedDevices: updatedTrusted } : u));
                  dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, user.id, { trustedDevices: updatedTrusted });
              }
          }
      }
  };

  const login = async (email: string, password: string, role?: UserRole): Promise<User | null> => {
    try {
        // Appwrite Auth
        await account.createEmailPasswordSession(email, password);
        const sessionUser = await account.get();

        // Get User Profile from DB
        const userProfile = await databases.getDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_IDS.USERS,
            sessionUser.$id
        );

        const appUser: User = {
            id: userProfile.$id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            status: userProfile.status,
            ip: userProfile.ip,
            joinedAt: userProfile.joinedAt,
            subscriptionPlan: userProfile.subscriptionPlan,
            isAdFree: userProfile.isAdFree,
            profilePicUrl: userProfile.profilePicUrl,
            trustedDevices: userProfile.trustedDevices
        };

        if (role && appUser.role !== role && appUser.role !== 'admin') {
            await account.deleteSession('current');
            return null;
        }
        
        if (appUser.status === 'pending') throw new Error("Account pending approval.");
        if (appUser.status === 'blocked') throw new Error("Account has been suspended.");

        // First Device Logic (Post-Login check)
        if (!appUser.trustedDevices || appUser.trustedDevices.length === 0) {
             const updatedTrusted = [currentDeviceId];
             appUser.trustedDevices = updatedTrusted;
             dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, appUser.id, { trustedDevices: updatedTrusted });
        }
        
        setCurrentUser(appUser);
        return appUser;
    } catch (err) {
        console.error("Appwrite login failed:", err);
        return null;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'publisher'): Promise<{ success: boolean; message?: string }> => {
    try {
        // 1. Create Auth Account
        const userId = uniqueId();
        await account.create(userId, email, password, name);

        // 2. Create DB Profile
        const initialStatus = role === 'publisher' ? 'pending' : 'active';
        const newUser: User = {
            id: userId,
            name, email, role, 
            status: initialStatus,
            ip: visitorIp,
            joinedAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            subscriptionPlan: role === 'subscriber' ? 'free' : undefined,
            profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            trustedDevices: [currentDeviceId] 
        };

        // Remove ID from object for insert (Appwrite takes ID as arg 3)
        const { id, ...userData } = newUser;
        await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, userData, userId);

        setUsers(prev => [...prev, newUser]);
        
        if (initialStatus === 'active') {
            // Auto login
            await account.createEmailPasswordSession(email, password);
            setCurrentUser(newUser);
            return { success: true };
        }

        return { success: true, message: "Account created! Pending admin approval." };
    } catch (e: any) {
        console.error("Register Error:", e);
        return { success: false, message: e.message || "Registration failed." };
    }
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      if (!currentUser || currentUser.role !== 'admin') return false;
      // Similar to register, but sets role='admin'
      try {
          const userId = uniqueId();
          // We can't use account.create while logged in as admin without API keys server-side
          // For client-side admin creation, usually you'd logout or use a cloud function.
          // FOR DEMO: We will just create the DB entry and assume Auth is handled separately or user registers themselves.
          // ALERT: Client SDK cannot create other users easily while logged in. 
          // WORKAROUND: Just creating DB entry for demo visualization.
          const newAdmin: User = {
              id: userId, name, email, role: 'admin', status: 'active',
              ip: visitorIp, joinedAt: new Date().toLocaleDateString(),
              profilePicUrl: '', trustedDevices: []
          };
          const { id, ...data } = newAdmin;
          await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, data, userId);
          setUsers(prev => [...prev, newAdmin]);
          return true;
      } catch (e) { return false; }
  };

  const setupMasterAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
      try {
          // Check if admin exists in DB
          const response = await databases.listDocuments(APPWRITE_CONFIG.DATABASE_ID, APPWRITE_CONFIG.COLLECTION_IDS.USERS, [
              Query.equal('role', 'admin')
          ]);
          if(response.documents.length > 0) return false;

          const userId = uniqueId(); // or CHIEF_EDITOR_ID if formatted correctly
          await account.create(userId, email, password, name);
          
          const masterAdmin: User = {
              id: userId, name, email, role: 'admin', status: 'active',
              ip: visitorIp, joinedAt: new Date().toLocaleDateString(),
              profilePicUrl: '', trustedDevices: [currentDeviceId]
          };
          const { id, ...data } = masterAdmin;
          await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, data, userId);
          
          setUsers(prev => [...prev, masterAdmin]);
          // Login
          await account.createEmailPasswordSession(email, password);
          setCurrentUser(masterAdmin);
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  };

  const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch(e) {}
    localStorage.removeItem('cj_current_user');
    setCurrentUser(null);
  };

  // ... Recovery functions (simulated mostly, as Appwrite has its own recovery)
  const initiateRecovery = async (email: string) => {
      // Appwrite native way: account.createRecovery(email, url);
      // Using existing simulation logic linked to DB for now
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { success: false, message: "Email not found." };
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newRequest = { email: user.email, userName: user.name, code: code, timestamp: Date.now() };
      setRecoveryRequests(prev => [...prev, newRequest]);
      return { success: true, message: `Code: ${code}`, code: code };
  };

  const completeRecovery = async (email: string, code: string, newPassword: string) => {
      // Appwrite native way: account.updateRecovery(...)
      // Simulation:
      const request = recoveryRequests.find(r => r.email === email && r.code === code);
      if(!request) return { success: false, message: "Invalid code" };
      const user = users.find(u => u.email === email);
      if(user) {
          // Can't update password via DB, must use Auth API. 
          // Client SDK can only update OWN password.
          // This part usually requires server function for "Admin reset" or standard "Forgot PW" email flow.
          return { success: true, message: "Password updated (Simulated)" }; 
      }
      return { success: false, message: "User error" };
  };

  const resetPassword = async (password: string) => {
      try {
          await account.updatePassword(password);
          return true;
      } catch(e) { return false; }
  };

  const initiateProfileUpdate = async (newEmail?: string, newPassword?: string, newProfilePic?: string) => {
      // Simplified simulation
      return { code: '123456', message: "Code: 123456" };
  };

  const completeProfileUpdate = async (code: string) => {
      // Appwrite update
      if(!currentUser) return false;
      try {
          // Note: Updating email/password usually requires password confirmation in Appwrite
          // Here we just update the DB profile for metadata
          const updates: any = {};
          // if(newEmail) await account.updateEmail(newEmail, password);
          // if(newPassword) await account.updatePassword(newPassword, oldPassword);
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, currentUser.id, updates);
          return true;
      } catch(e) { return false; }
  };

  // --- SETTINGS UPDATES ---
  const updateEmailSettings = async (settings: EmailSettings) => {
      setEmailSettings(settings);
      // Upsert logic for Appwrite (search then update or create)
      // Simplified: Just update local for demo, real app needs document ID management for settings
  };
  const updateSubscriptionSettings = async (settings: SubscriptionSettings) => setSubscriptionSettings(settings);
  const updateAdSettings = async (settings: AdSettings) => setAdSettings(settings);
  const updateWatermarkSettings = async (settings: WatermarkSettings) => setWatermarkSettings(settings);
  
  const getAnalytics = (): AnalyticsData => {
      return { totalViews: 1250, avgViewsPerArticle: 45, categoryDistribution: [], dailyVisits: [], geoSources: [] };
  };

  // --- CRUD OPERATIONS (Connected to Appwrite) ---
  
  const addArticle = async (article: Article) => {
      const { id, ...data } = article;
      const newId = uniqueId();
      const newArticle = { ...article, id: newId };
      setArticles(prev => [newArticle, ...prev]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES, data, newId);
  };

  const updateArticle = async (updatedArticle: Article) => {
      const { id, ...data } = updatedArticle;
      setArticles(prev => prev.map(a => a.id === id ? updatedArticle : a));
      await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES, id, data);
  };

  const deleteArticle = async (id: string) => {
      setArticles(prev => prev.filter(a => a.id !== id));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES, id);
  };

  const incrementArticleView = async (id: string) => {
      const article = articles.find(a => a.id === id);
      if(article) {
          const newViews = (article.views || 0) + 1;
          setArticles(prev => prev.map(a => a.id === id ? { ...a, views: newViews } : a));
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES, id, { views: newViews });
      }
  };

  const addCategory = async (category: string) => setCategories(prev => [...prev, category]);
  const deleteCategory = async (category: string) => setCategories(prev => prev.filter(c => c !== category));

  const addEPaperPage = async (page: EPaperPage) => {
      const { id, ...data } = page;
      const newId = uniqueId();
      const newPage = { ...page, id: newId };
      setEPaperPages(prev => [...prev, newPage]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.EPAPER, data, newId);
  };

  const deleteEPaperPage = async (id: string) => {
      setEPaperPages(prev => prev.filter(p => p.id !== id));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.EPAPER, id);
  };

  const deleteAllEPaperPages = async () => {
      // Appwrite doesn't have "Delete All", must loop.
      const ids = ePaperPages.map(p => p.id);
      setEPaperPages([]);
      for(const id of ids) await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.EPAPER, id);
  };

  const addClipping = async (clipping: Clipping) => {
      const { id, ...data } = clipping;
      const newId = uniqueId();
      const newClip = { ...clipping, id: newId, userId: currentUser?.id };
      setClippings(prev => [newClip, ...prev]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.CLIPPINGS, { ...data, userId: currentUser?.id }, newId);
  };

  const deleteClipping = async (id: string) => {
      setClippings(prev => prev.filter(c => c.id !== id));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.CLIPPINGS, id);
  };

  const deleteUser = async (id: string) => {
      if(id === CHIEF_EDITOR_ID) return;
      setUsers(prev => prev.filter(u => u.id !== id));
      // Delete from DB. Note: Does not delete from Auth (requires server SDK)
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.USERS, id);
  };

  const toggleUserStatus = async (id: string) => {
      const user = users.find(u => u.id === id);
      if(user) {
          const nextStatus = user.status === 'active' ? 'blocked' : 'active';
          setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, id, { status: nextStatus });
      }
  };

  const toggleUserSubscription = async (id: string) => {
      const user = users.find(u => u.id === id);
      if(user) {
          const newPlan = user.subscriptionPlan === 'premium' ? 'free' : 'premium';
          setUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionPlan: newPlan } : u));
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, id, { subscriptionPlan: newPlan });
      }
  };
  
  const toggleUserAdStatus = async (id: string) => {
      const user = users.find(u => u.id === id);
      if(user) {
          const newStatus = !user.isAdFree;
          setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdFree: newStatus } : u));
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.USERS, id, { isAdFree: newStatus });
      }
  };

  const addAdvertisement = async (ad: Advertisement) => {
      const { id, ...data } = ad;
      const newId = uniqueId();
      const newAd = { ...ad, id: newId };
      setAdvertisements(prev => [...prev, newAd]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.ADS, data, newId);
  };

  const updateAdvertisement = async (ad: Advertisement) => {
      const { id, ...data } = ad;
      setAdvertisements(prev => prev.map(a => a.id === id ? ad : a));
      await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.ADS, id, data);
  };

  const deleteAdvertisement = async (id: string) => {
      setAdvertisements(prev => prev.filter(a => a.id !== id));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.ADS, id);
  };

  const toggleAdStatus = async (id: string) => {
      const ad = advertisements.find(a => a.id === id);
      if(ad) {
          const newStatus = ad.status === 'active' ? 'inactive' : 'active';
          setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.ADS, id, { status: newStatus });
      }
  };

  const trackAdClick = async (id: string) => {
      const ad = advertisements.find(a => a.id === id);
      if(ad) {
          const newClicks = ad.clicks + 1;
          setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, clicks: newClicks } : a));
          await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.ADS, id, { clicks: newClicks });
      }
  };

  const approveContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      const status = type === 'article' ? 'published' : 'active';
      const collection = type === 'article' ? APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES : type === 'ad' ? APPWRITE_CONFIG.COLLECTION_IDS.ADS : APPWRITE_CONFIG.COLLECTION_IDS.EPAPER;
      
      if (type === 'article') setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'published' } : a));
      else if (type === 'ad') setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
      else setEPaperPages(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));

      await dbUpdate(collection, id, { status });
  };

  const rejectContent = async (type: 'article' | 'ad' | 'epaper', id: string) => {
      const status = type === 'article' ? 'draft' : 'inactive';
      const collection = type === 'article' ? APPWRITE_CONFIG.COLLECTION_IDS.ARTICLES : type === 'ad' ? APPWRITE_CONFIG.COLLECTION_IDS.ADS : APPWRITE_CONFIG.COLLECTION_IDS.EPAPER;
      
      if (type === 'article') setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'draft' } : a));
      else if (type === 'ad') setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: 'inactive' } : a));
      else setEPaperPages(prev => prev.map(p => p.id === id ? { ...p, status: 'pending' } : p));

      await dbUpdate(collection, id, { status });
  };

  const addComment = async (articleId: string, content: string) => {
      if (!currentUser) return;
      const newComment = {
          articleId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.profilePicUrl,
          content, timestamp: Date.now(), likes: 0, dislikes: 0, likedBy: [], dislikedBy: []
      };
      const id = uniqueId();
      setComments(prev => [{...newComment, id}, ...prev]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.COMMENTS, newComment, id);
  };

  const voteComment = async (commentId: string, type: 'like' | 'dislike') => {
      // Simplified update logic
  };

  const deleteComment = async (commentId: string) => {
      setComments(prev => prev.filter(c => c.id !== commentId));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.COMMENTS, commentId);
  };

  const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
      const msg = { name, email, subject, message, timestamp: Date.now(), read: false };
      const id = uniqueId();
      setContactMessages(prev => [{...msg, id}, ...prev]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.MESSAGES, msg, id);
  };

  const markMessageAsRead = async (id: string) => {
      setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      await dbUpdate(APPWRITE_CONFIG.COLLECTION_IDS.MESSAGES, id, { read: true });
  };

  const deleteMessage = async (id: string) => {
      setContactMessages(prev => prev.filter(m => m.id !== id));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.MESSAGES, id);
  };

  const addClassified = async (c: Classified) => {
      const { id, ...data } = c;
      const newId = uniqueId();
      setClassifieds(prev => [{...c, id: newId}, ...prev]);
      await dbCreate(APPWRITE_CONFIG.COLLECTION_IDS.CLASSIFIEDS, data, newId);
  };

  const deleteClassified = async (id: string) => {
      setClassifieds(prev => prev.filter(c => c.id !== id));
      await dbDelete(APPWRITE_CONFIG.COLLECTION_IDS.CLASSIFIEDS, id);
  };

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
