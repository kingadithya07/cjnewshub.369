
import React, { useState, useEffect, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { Article, EPaperPage, User, Advertisement, AdSize, Classified } from '../types';
import { Trash2, Upload, FileText, Image as ImageIcon, Sparkles, Video, Save, Edit, CheckCircle, Calendar, Users, Ban, Power, Shield, ShieldAlert, Settings, Mail, DollarSign, CreditCard, Film, Type, X, Megaphone, Star, BarChart3, Inbox, MessageSquare, Tag, Plus, Briefcase, MapPin, Eye, MonitorOff, Globe, Menu, ChevronLeft, ChevronRight, Home, LogOut, LayoutDashboard, Newspaper, User as UserIcon } from 'lucide-react';
import { CHIEF_EDITOR_ID } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { RichTextEditor } from '../components/RichTextEditor';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

export const Admin: React.FC = () => {
  const { 
      articles, categories, addCategory, deleteCategory, ePaperPages, addArticle, updateArticle, deleteArticle, 
      addEPaperPage, deleteEPaperPage, deleteAllEPaperPages, currentUser, users, deleteUser, toggleUserStatus, toggleUserSubscription, toggleUserAdStatus, createAdmin,
      advertisements, addAdvertisement, updateAdvertisement, deleteAdvertisement, toggleAdStatus,
      watermarkSettings, updateWatermarkSettings, approveContent, rejectContent, recoveryRequests,
      initiateProfileUpdate, completeProfileUpdate, emailSettings, updateEmailSettings,
      subscriptionSettings, updateSubscriptionSettings, adSettings, updateAdSettings,
      contactMessages, markMessageAsRead, deleteMessage,
      classifieds, addClassified, deleteClassified, logout
    } = useNews();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'articles' | 'epaper' | 'publishers' | 'subscribers' | 'ads' | 'admins' | 'approvals' | 'settings' | 'analytics' | 'inbox' | 'categories' | 'classifieds'>('articles');
  
  // Dashboard UI State
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Checks
  const isChiefEditor = currentUser?.id === CHIEF_EDITOR_ID;
  const isAdmin = currentUser?.role === 'admin';
  const isPublisher = currentUser?.role === 'publisher';
  const canPublish = isAdmin || isPublisher;

  // Filter Articles based on Role
  const displayedArticles = useMemo(() => {
      if (isPublisher) {
          // Publishers only see their own articles
          return articles.filter(a => a.authorId === currentUser?.id);
      }
      // Admins see all articles
      return articles;
  }, [articles, currentUser, isPublisher]);

  // Article Form State
  const initialFormState: Partial<Article> = {
    category: categories[0] || 'World',
    tags: [],
    status: 'draft',
    isFeatured: false,
    title: '',
    excerpt: '',
    content: '',
    author: '',
    imageUrl: '',
    videoUrl: '',
    views: 0
  };

  const [articleForm, setArticleForm] = useState<Partial<Article>>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageSourceType, setImageSourceType] = useState<'url' | 'upload'>('url');
  const [videoSourceType, setVideoSourceType] = useState<'url' | 'upload'>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // EPaper Form State
  const [ePaperUrl, setEPaperUrl] = useState('');
  const [ePaperDate, setEPaperDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Watermark Form State
  const [watermarkFormText, setWatermarkFormText] = useState(watermarkSettings.text);
  const [watermarkFormLogo, setWatermarkFormLogo] = useState<string | null>(watermarkSettings.logoUrl);

  // Email Settings Form State
  const [emailApiKey, setEmailApiKey] = useState(emailSettings.apiKey);
  const [emailSender, setEmailSender] = useState(emailSettings.senderEmail);
  const [emailCompany, setEmailCompany] = useState(emailSettings.companyName);
  const [emailTemplate, setEmailTemplate] = useState(emailSettings.emailTemplate);

  // Subscription Settings Form State
  const [subShowPayment, setSubShowPayment] = useState(subscriptionSettings.showPaymentButton);
  const [subPaymentLink, setSubPaymentLink] = useState(subscriptionSettings.paymentLink);
  const [subPrice, setSubPrice] = useState(subscriptionSettings.monthlyPrice);

  // Ad Settings Form State
  const [globalAdsEnabled, setGlobalAdsEnabled] = useState(adSettings.enableAdsGlobally);

  // Admin Create Form
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Settings / Profile Update State
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsProfilePic, setSettingsProfilePic] = useState<string | null>(null);
  const [isProfileVerifying, setIsProfileVerifying] = useState(false);
  const [profileVerificationCode, setProfileVerificationCode] = useState('');
  
  // Classifieds Form State
  const [classifiedForm, setClassifiedForm] = useState<Partial<Classified>>({
      category: 'Jobs',
      title: '',
      description: '',
      contact: '',
      location: '',
      imageUrl: ''
  });

  // Load current user info into settings form
  useEffect(() => {
    if (currentUser) {
        setSettingsEmail(currentUser.email);
        setSettingsProfilePic(currentUser.profilePicUrl || null);
    }
  }, [currentUser]);

  // Update local forms when global settings change
  useEffect(() => {
      setWatermarkFormText(watermarkSettings.text);
      setWatermarkFormLogo(watermarkSettings.logoUrl);
      setEmailApiKey(emailSettings.apiKey);
      setEmailSender(emailSettings.senderEmail);
      setEmailCompany(emailSettings.companyName);
      setEmailTemplate(emailSettings.emailTemplate);
      setSubShowPayment(subscriptionSettings.showPaymentButton);
      setSubPaymentLink(subscriptionSettings.paymentLink);
      setSubPrice(subscriptionSettings.monthlyPrice);
      setGlobalAdsEnabled(adSettings.enableAdsGlobally);
  }, [watermarkSettings, emailSettings, subscriptionSettings, adSettings]);

  // Ad Form State
  const getToday = () => new Date().toISOString().split('T')[0];
  const getFutureDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
  };

  const initialAdFormState: Partial<Advertisement> = {
      advertiserName: '',
      imageUrl: '',
      targetUrl: '',
      size: AdSize.RECTANGLE,
      status: 'active',
      startDate: getToday(),
      endDate: getFutureDate(30),
      clicks: 0,
      clickedIps: []
  };
  const [adForm, setAdForm] = useState<Partial<Advertisement>>(initialAdFormState);
  const [adImageSourceType, setAdImageSourceType] = useState<'url' | 'upload'>('url');
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Inbox State
  const unreadMessagesCount = contactMessages.filter(m => !m.read).length;

  if (!currentUser) {
      return (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl font-serif font-bold text-ink mb-4">Access Restricted</h2>
              <p className="text-gray-600 mb-8 max-w-md">You must be logged in to access the dashboard.</p>
              <div className="flex gap-4">
                 <Link to="/login" className="bg-ink text-white px-8 py-3 text-xs font-bold tracking-widest hover:bg-gold hover:text-ink transition-colors">
                    LOGIN TO DASHBOARD
                 </Link>
              </div>
          </div>
      );
  }

  // Helper to format ISO YYYY-MM-DD to DD-MM-YYYY for display
  const formatDisplayDate = (ymd: string) => {
    if (!ymd) return '';
    const parts = ymd.split('-');
    if (parts.length !== 3) return ymd;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  };

  const pendingArticles = articles.filter(a => a.status === 'pending');
  const totalPending = pendingArticles.length; // Simplified for UI
  const subscriberUsers = users.filter(u => u.role === 'subscriber');
  const publisherUsers = users.filter(u => u.role === 'publisher');
  const adminUsers = users.filter(u => u.role === 'admin');

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  // --- FORM HANDLERS ---
  const handleEditClick = (article: Article) => {
      setEditingId(article.id);
      setArticleForm(article);
      setTagsInput(article.tags.join(', '));
      setMediaType(article.videoUrl ? 'video' : 'image');
      if (article.imageUrl && article.imageUrl.startsWith('data:')) {
          setImageSourceType('upload');
      } else {
          setImageSourceType('url');
      }
      setActiveTab('articles');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setArticleForm(initialFormState);
      setTagsInput('');
      setImageSourceType('url');
      setVideoSourceType('url');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { 
              alert("File size exceeds 2MB limit.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              // Simulating storing to 'public/uploads/images'
              setArticleForm(prev => ({ ...prev, imageUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 15 * 1024 * 1024) { 
              alert("Video size exceeds 15MB limit for this demo.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              // Simulating storing to 'public/uploads/videos'
              setArticleForm(prev => ({ ...prev, videoUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleArticleSubmit = async (statusOverride?: 'draft' | 'published') => {
      if (!articleForm.title || !articleForm.excerpt) {
          alert("Title and Excerpt are required.");
          return;
      }
      setIsSubmitting(true);

      const finalTags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const now = new Date();
      const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      const finalImage = articleForm.imageUrl || `https://picsum.photos/800/600?random=${Date.now()}`;

      // Determine Status: Use override if provided (button click), else form value, else default
      let finalStatus: 'draft' | 'published' | 'pending' = 'pending';
      
      if (isAdmin) {
          finalStatus = statusOverride || articleForm.status || 'draft';
      } else {
          // Publishers default to pending unless they have override (if logic allowed)
          finalStatus = 'pending';
      }

      const articleData: Article = {
          id: editingId || Date.now().toString(),
          title: articleForm.title || '',
          excerpt: articleForm.excerpt || '',
          content: articleForm.content || '',
          author: articleForm.author || currentUser.name,
          authorId: articleForm.authorId || currentUser.id,
          category: articleForm.category || categories[0] || 'General',
          date: editingId ? (articleForm.date || todayStr) : todayStr,
          imageUrl: finalImage,
          videoUrl: articleForm.videoUrl,
          tags: finalTags,
          status: finalStatus,
          isFeatured: articleForm.isFeatured || false,
          views: editingId ? (articleForm.views || 0) : 0
      };

      if (editingId) {
          await updateArticle(articleData);
          alert(`Article updated successfully as ${finalStatus.toUpperCase()}!`);
      } else {
          await addArticle(articleData);
          alert(`Article created successfully as ${finalStatus.toUpperCase()}!`);
      }
      setIsSubmitting(false);
      handleCancelEdit();
  };

  const handleCategoryAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newCategoryName.trim()) {
          await addCategory(newCategoryName);
          setNewCategoryName('');
      }
  };

  const handleEPaperSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!ePaperUrl) return;
      const pagesForDate = ePaperPages.filter(p => p.date === ePaperDate);
      const newPage: EPaperPage = {
          id: Date.now().toString(),
          pageNumber: pagesForDate.length + 1,
          date: ePaperDate,
          imageUrl: ePaperUrl,
          status: 'active'
      };
      await addEPaperPage(newPage);
      setEPaperUrl('');
      alert(isChiefEditor ? `Page added for ${formatDisplayDate(ePaperDate)}!` : 'Page submitted for approval.');
  };

  const handleWatermarkSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isChiefEditor) return;
      await updateWatermarkSettings({
          text: watermarkFormText,
          logoUrl: watermarkFormLogo
      });
      alert('Watermark settings updated!');
  };

  const handleEmailSettingsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateEmailSettings({
          apiKey: emailApiKey,
          senderEmail: emailSender,
          companyName: emailCompany,
          emailTemplate: emailTemplate
      });
      alert("Email configuration updated successfully.");
  };

  const handleSubscriptionSettingsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateSubscriptionSettings({
          showPaymentButton: subShowPayment,
          paymentLink: subPaymentLink,
          monthlyPrice: subPrice
      });
      alert("Subscription payment settings updated.");
  };

  const handleAdSettingsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateAdSettings({
          enableAdsGlobally: globalAdsEnabled
      });
      alert("Global Ad settings updated.");
  };

  const handleWatermarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setWatermarkFormLogo(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSettingsProfilePic(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isChiefEditor) return;
      if (await createAdmin(newAdminName, newAdminEmail, newAdminPassword)) {
          alert(`Admin ${newAdminName} created successfully.`);
          setNewAdminName('');
          setNewAdminEmail('');
          setNewAdminPassword('');
      } else {
          alert('Failed to create admin. Email might already be in use.');
      }
  };

  const handleInitiateProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await initiateProfileUpdate(settingsEmail, settingsPassword, settingsProfilePic || undefined);
      if (result) {
          setIsProfileVerifying(true);
          alert(`(SIMULATION EMAIL sent to ${currentUser.email})\n\n${result.message}`);
      } else {
          alert("Failed to initiate update.");
      }
  };

  const handleCompleteProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await completeProfileUpdate(profileVerificationCode);
      if (success) {
          alert("Profile updated successfully!");
          setIsProfileVerifying(false);
          setProfileVerificationCode('');
          setSettingsPassword('');
      } else {
          alert("Invalid verification code. Please try again.");
      }
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adForm.advertiserName || !adForm.imageUrl || !adForm.targetUrl) {
          alert("Please fill in all ad details.");
          return;
      }

      if (editingAdId) {
          const updatedAd: Advertisement = {
              id: editingAdId,
              advertiserName: adForm.advertiserName!,
              imageUrl: adForm.imageUrl!,
              targetUrl: adForm.targetUrl!,
              size: adForm.size || AdSize.RECTANGLE,
              status: adForm.status || 'active',
              startDate: adForm.startDate || getToday(),
              endDate: adForm.endDate || getFutureDate(30),
              clicks: adForm.clicks || 0,
              clickedIps: adForm.clickedIps || []
          };
          await updateAdvertisement(updatedAd);
          alert(isChiefEditor ? "Advertisement updated successfully!" : "Advertisement update submitted for approval.");
      } else {
          const newAd: Advertisement = {
              id: Date.now().toString(),
              advertiserName: adForm.advertiserName!,
              imageUrl: adForm.imageUrl!,
              targetUrl: adForm.targetUrl!,
              size: adForm.size || AdSize.RECTANGLE,
              status: adForm.status || 'active',
              startDate: adForm.startDate || getToday(),
              endDate: adForm.endDate || getFutureDate(30),
              clicks: 0,
              clickedIps: []
          };
          await addAdvertisement(newAd);
          alert(isChiefEditor ? "Advertisement posted successfully!" : "Advertisement submitted for approval.");
      }
      handleCancelAdEdit();
  };

  const handleCancelAdEdit = () => {
      setEditingAdId(null);
      setAdForm(initialAdFormState);
      setAdImageSourceType('url');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEPaperUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  // Classifieds Logic
  const handleClassifiedSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!classifiedForm.title || !classifiedForm.description || !classifiedForm.category) return;

      const newClassified: Classified = {
          id: Date.now().toString(),
          category: classifiedForm.category as any,
          title: classifiedForm.title || '',
          description: classifiedForm.description || '',
          contact: classifiedForm.contact || '',
          location: classifiedForm.location || '',
          imageUrl: classifiedForm.imageUrl,
          timestamp: Date.now()
      };
      
      await addClassified(newClassified);
      setClassifiedForm({
          category: 'Jobs',
          title: '',
          description: '',
          contact: '',
          location: '',
          imageUrl: ''
      });
      alert('Classified ad posted successfully!');
  };

  const handleClassifiedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { 
              alert("File size exceeds 2MB limit.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setClassifiedForm(prev => ({ ...prev, imageUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  // --- NAVIGATION MENU CONFIG ---
  const navItems = [
    { id: 'articles', label: 'Articles', icon: FileText, allowed: true },
    { id: 'epaper', label: 'E-Paper', icon: Newspaper, allowed: isAdmin },
    { id: 'publishers', label: 'Publishers', icon: Users, allowed: isAdmin },
    { id: 'subscribers', label: 'Subscribers', icon: Users, allowed: isAdmin },
    { id: 'classifieds', label: 'Classifieds', icon: Briefcase, allowed: isAdmin },
    { id: 'categories', label: 'Categories', icon: Tag, allowed: isAdmin },
    { id: 'ads', label: 'Ads', icon: Megaphone, allowed: isAdmin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, allowed: isAdmin },
    { id: 'admins', label: 'Admins', icon: ShieldAlert, allowed: isChiefEditor },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle, allowed: isChiefEditor, badge: totalPending },
    { id: 'inbox', label: 'Inbox', icon: Inbox, allowed: isChiefEditor, badge: unreadMessagesCount },
    { id: 'settings', label: 'Settings', icon: Settings, allowed: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-ink text-white transition-all duration-300 flex flex-col border-r border-gray-800 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {/* Sidebar Header */}
          <div className={`h-16 flex items-center justify-center border-b border-gray-800 relative ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
              {!isSidebarCollapsed ? (
                  <h1 className="font-serif font-black text-xl tracking-tight text-white">CJ<span className="text-gold">NEWS</span>HUB</h1>
              ) : (
                  <h1 className="font-serif font-black text-xl tracking-tight text-gold">CJ</h1>
              )}
              {/* Close Button for Mobile */}
              <button className="absolute right-4 md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} />
              </button>
          </div>

          {/* User Info (Collapsed vs Expanded) */}
          <div className={`p-4 border-b border-gray-800 flex items-center gap-3 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden border border-gray-600">
                  {currentUser?.profilePicUrl ? (
                      <img src={currentUser.profilePicUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                      <UserIcon size={20} className="text-gray-400 m-auto mt-2" />
                  )}
              </div>
              {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                      <p className="font-bold text-sm truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider truncate">{currentUser.role}</p>
                  </div>
              )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 scrollbar-hide">
              {navItems.filter(item => item.allowed).map(item => (
                  <button
                      key={item.id}
                      onClick={() => {
                          setActiveTab(item.id as any);
                          setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group relative
                          ${activeTab === item.id 
                              ? 'bg-gold text-ink font-bold shadow-md' 
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      title={isSidebarCollapsed ? item.label : ''}
                  >
                      <item.icon size={20} className={`${activeTab === item.id ? 'text-ink' : 'text-gray-400 group-hover:text-white'} flex-shrink-0`} />
                      
                      {!isSidebarCollapsed && (
                          <span className="text-sm font-medium tracking-wide flex-1 text-left">{item.label}</span>
                      )}

                      {/* Badge Logic */}
                      {item.badge !== undefined && item.badge > 0 && (
                          <span className={`flex items-center justify-center rounded-full text-[10px] font-bold ${isSidebarCollapsed ? 'absolute top-2 right-2 w-2 h-2 p-0 bg-red-500' : 'bg-red-500 text-white px-2 py-0.5'}`}>
                              {!isSidebarCollapsed && item.badge}
                          </span>
                      )}
                  </button>
              ))}
          </nav>

          {/* Footer / Toggle */}
          <div className="p-4 border-t border-gray-800 space-y-2">
              <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Back to Site">
                  <Home size={20} />
                  {!isSidebarCollapsed && <span className="text-sm font-medium">Back to Site</span>}
              </button>
              
              <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Logout">
                  <LogOut size={20} />
                  {!isSidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
              </button>

              {/* Desktop Toggle Button */}
              <button 
                  onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} 
                  className="hidden md:flex w-full items-center justify-center py-2 text-gray-500 hover:text-white transition-colors mt-2 border-t border-gray-800 pt-4"
              >
                  {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
          
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                  <button onClick={() => setMobileMenuOpen(true)} className="text-ink p-1">
                      <Menu size={24} />
                  </button>
                  <h1 className="font-serif font-bold text-lg text-ink">Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gold-dark uppercase tracking-widest">{activeTab}</span>
              </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                  
                  {/* Desktop Header / Title */}
                  <div className="hidden md:flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                      <div>
                        <h1 className="text-3xl font-serif font-bold text-ink flex items-center gap-3">
                            {navItems.find(i => i.id === activeTab)?.icon && React.createElement(navItems.find(i => i.id === activeTab)!.icon, {size: 32, className: "text-gold"})}
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your {activeTab} content and settings.</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                          <LayoutDashboard size={14} />
                          <span>CMS v2.5</span>
                      </div>
                  </div>

                  {/* Render Active Tab Content */}
                  {/* --- ARTICLES TAB (Restricted View for Publishers) --- */}
                  {activeTab === 'articles' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {/* Form Section */}
                          <div className="lg:col-span-8 bg-white p-4 md:p-6 shadow-sm border-t-4 border-gold rounded-sm">
                              <h3 className="font-serif font-bold text-lg md:text-xl mb-4 text-gray-700 flex items-center gap-2">
                                  <FileText size={20}/> {editingId ? 'Edit Article' : 'New Article'}
                              </h3>
                              
                              <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                                          <input required type="text" className="w-full border p-3 text-sm focus:ring-1 focus:ring-gold outline-none" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                                          <select className="w-full border p-3 text-sm outline-none bg-white" value={articleForm.category} onChange={e => setArticleForm({...articleForm, category: e.target.value})}>
                                              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                          </select>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                           <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Featured Image</label>
                                           <div className="flex gap-4 mb-2">
                                               <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={imageSourceType === 'url'} onChange={() => setImageSourceType('url')} className="accent-gold"/> <span className="text-xs">URL</span></label>
                                               <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={imageSourceType === 'upload'} onChange={() => setImageSourceType('upload')} className="accent-gold"/> <span className="text-xs">Upload</span></label>
                                           </div>
                                           {imageSourceType === 'url' ? (
                                               <input type="text" placeholder="https://..." className="w-full border p-3 text-sm focus:ring-1 focus:ring-gold outline-none" value={articleForm.imageUrl} onChange={e => setArticleForm({...articleForm, imageUrl: e.target.value})} />
                                           ) : (
                                               <div className="border border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    <span className="text-xs text-gray-500 flex flex-col items-center gap-1">
                                                        <ImageIcon size={16} /> <span>Choose File</span>
                                                    </span>
                                               </div>
                                           )}
                                           {articleForm.imageUrl && <img src={articleForm.imageUrl} className="mt-2 w-full h-24 object-cover border bg-gray-50" alt="Preview"/>}
                                      </div>

                                      <div>
                                           <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Video (Optional)</label>
                                           <div className="flex gap-4 mb-2">
                                               <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={videoSourceType === 'url'} onChange={() => setVideoSourceType('url')} className="accent-gold"/> <span className="text-xs">URL</span></label>
                                               <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={videoSourceType === 'upload'} onChange={() => setVideoSourceType('upload')} className="accent-gold"/> <span className="text-xs">Upload</span></label>
                                           </div>
                                           {videoSourceType === 'url' ? (
                                               <input type="text" placeholder="https://..." className="w-full border p-3 text-sm focus:ring-1 focus:ring-gold outline-none" value={articleForm.videoUrl || ''} onChange={e => setArticleForm({...articleForm, videoUrl: e.target.value})} />
                                           ) : (
                                               <div className="border border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    <span className="text-xs text-gray-500 flex flex-col items-center gap-1">
                                                        <Video size={16} /> <span>Choose File</span>
                                                    </span>
                                               </div>
                                           )}
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Excerpt</label>
                                      <textarea rows={2} required className="w-full border p-3 text-sm focus:ring-1 focus:ring-gold outline-none" value={articleForm.excerpt} onChange={e => setArticleForm({...articleForm, excerpt: e.target.value})} />
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Content</label>
                                      <RichTextEditor value={articleForm.content || ''} onChange={(content) => setArticleForm({ ...articleForm, content })} />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tags (Comma Separated)</label>
                                            <input type="text" placeholder="News, Politics, Local" className="w-full border p-3 text-sm focus:ring-1 focus:ring-gold outline-none" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
                                       </div>
                                       
                                       {/* Status Selector - Visible to Admins */}
                                       {isAdmin && (
                                           <div>
                                               <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                                               <select 
                                                   className="w-full border p-3 text-sm outline-none bg-white font-bold" 
                                                   value={articleForm.status || 'draft'} 
                                                   onChange={e => setArticleForm({...articleForm, status: e.target.value as any})}
                                               >
                                                   <option value="draft">Draft</option>
                                                   <option value="published">Published</option>
                                                   <option value="pending">Pending</option>
                                               </select>
                                           </div>
                                       )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" checked={articleForm.isFeatured || false} onChange={e => setArticleForm({...articleForm, isFeatured: e.target.checked})} className="w-4 h-4 accent-gold" />
                                            <span className="text-sm font-bold text-gray-700">Feature on Homepage</span>
                                        </label>
                                   </div>

                                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                                      {editingId && (
                                          <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-3 font-bold uppercase text-xs hover:bg-gray-300 transition-colors">
                                              Cancel
                                          </button>
                                      )}
                                      
                                      {isAdmin ? (
                                          <>
                                            <button 
                                                type="button" 
                                                onClick={() => handleArticleSubmit('draft')} 
                                                disabled={isSubmitting} 
                                                className="flex-1 bg-gray-500 text-white py-3 font-bold uppercase text-xs hover:bg-gray-600 transition-colors disabled:opacity-70"
                                            >
                                                Save Draft
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleArticleSubmit('published')}
                                                disabled={isSubmitting} 
                                                className="flex-1 bg-ink text-white py-3 font-bold uppercase text-xs hover:bg-gold hover:text-ink transition-colors disabled:opacity-70"
                                            >
                                                {editingId ? 'Update & Publish' : 'Publish Now'}
                                            </button>
                                          </>
                                      ) : (
                                          <button 
                                              type="button" 
                                              onClick={() => handleArticleSubmit()}
                                              disabled={isSubmitting} 
                                              className="flex-1 bg-ink text-white py-3 font-bold uppercase text-xs hover:bg-gold hover:text-ink transition-colors disabled:opacity-70"
                                          >
                                              {isSubmitting ? 'Saving...' : 'Submit for Review'}
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>

                          {/* List Section - Filtered for Publishers */}
                          <div className="lg:col-span-4 space-y-4">
                               <div className="bg-white p-4 md:p-6 shadow-sm border border-gray-200 rounded-sm">
                                   <h3 className="font-serif font-bold text-lg mb-4 text-gray-700">
                                       {isPublisher ? 'My Articles' : 'Recent Articles'}
                                   </h3>
                                   <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                       {displayedArticles.length === 0 && <p className="text-gray-500 italic text-sm">No articles found.</p>}
                                       {displayedArticles.map(article => (
                                           <div key={article.id} className={`p-4 border rounded transition-all ${editingId === article.id ? 'border-gold bg-gold/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                               <h4 className="font-bold text-sm text-ink line-clamp-2 mb-1">{article.title}</h4>
                                               <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                                   <span>{article.date}</span>
                                                   <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${article.status === 'published' ? 'bg-green-100 text-green-700' : article.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                                                       {article.status}
                                                   </span>
                                               </div>
                                               <div className="flex gap-2">
                                                   <button onClick={() => handleEditClick(article)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded hover:bg-gray-200 flex items-center justify-center gap-1">
                                                       <Edit size={12}/> Edit
                                                   </button>
                                                   <button onClick={() => { if(window.confirm('Delete this article?')) deleteArticle(article.id); }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                                       <Trash2 size={14} />
                                                   </button>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          </div>
                      </div>
                  )}

                  {/* --- E-PAPER TAB --- */}
                  {activeTab === 'epaper' && isAdmin && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                           <div className="bg-white p-6 shadow-sm border-t-4 border-gold rounded-sm">
                               <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2">
                                   <Upload size={20}/> Upload Page
                               </h3>
                               <form onSubmit={handleEPaperSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Issue Date</label>
                                        <input type="date" required className="w-full border p-3 text-sm focus:ring-1 focus:ring-gold outline-none" value={ePaperDate} onChange={e => setEPaperDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Page Image</label>
                                        <div className="border border-dashed border-gray-300 p-8 text-center cursor-pointer hover:bg-gray-50 relative rounded">
                                            <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <Upload size={24} />
                                                <span className="text-sm font-bold">Click to Upload Page</span>
                                                <span className="text-xs">(JPG, PNG max 5MB)</span>
                                            </div>
                                        </div>
                                        {ePaperUrl && <img src={ePaperUrl} className="mt-4 w-full h-48 object-contain bg-gray-100 border" alt="Preview" />}
                                    </div>
                                    <button type="submit" className="w-full bg-ink text-white py-3 font-bold uppercase text-xs hover:bg-gold hover:text-ink transition-colors tracking-widest">
                                        Add Page to Issue
                                    </button>
                               </form>

                               {/* Watermark Settings */}
                               {isChiefEditor && (
                                   <div className="mt-8 pt-8 border-t border-gray-200">
                                        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Sparkles size={16}/> Watermark Settings</h4>
                                        <form onSubmit={handleWatermarkSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Watermark Text</label>
                                                <input type="text" className="w-full border p-2 text-sm focus:ring-1 focus:ring-gold outline-none" value={watermarkFormText} onChange={e => setWatermarkFormText(e.target.value)} placeholder="e.g. CJ NEWS HUB" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Logo URL (Optional)</label>
                                                <div className="flex gap-2">
                                                    <input type="text" className="w-full border p-2 text-sm focus:ring-1 focus:ring-gold outline-none" value={watermarkFormLogo || ''} onChange={e => setWatermarkFormLogo(e.target.value)} placeholder="https://..." />
                                                    <label className="bg-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-300 rounded"><ImageIcon size={16}/><input type="file" accept="image/*" className="hidden" onChange={handleWatermarkLogoUpload}/></label>
                                                </div>
                                                {watermarkFormLogo && <img src={watermarkFormLogo} className="mt-2 h-10 object-contain" alt="Watermark Logo" />}
                                            </div>
                                            <button type="submit" className="w-full bg-gray-800 text-white py-2 text-xs font-bold uppercase hover:bg-gray-700">Save Settings</button>
                                        </form>
                                   </div>
                               )}
                           </div>

                           <div className="space-y-6">
                               <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-serif font-bold text-xl text-gray-700">Current Issue Pages</h3>
                                    {ePaperPages.length > 0 && (
                                        <button 
                                            onClick={() => { if(window.confirm('Are you sure you want to delete ALL pages? This cannot be undone.')) deleteAllEPaperPages(); }}
                                            className="text-red-600 text-xs font-bold uppercase hover:bg-red-50 px-3 py-1 rounded border border-red-200"
                                        >
                                            Delete All
                                        </button>
                                    )}
                               </div>
                               {ePaperPages.length === 0 ? <p className="text-gray-500 italic">No pages uploaded yet.</p> : (
                                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                       {ePaperPages.sort((a,b) => b.date.localeCompare(a.date) || a.pageNumber - b.pageNumber).map(page => (
                                           <div key={page.id} className="bg-white p-2 border border-gray-200 shadow-sm relative group rounded-sm">
                                               <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-2">
                                                   <img src={page.imageUrl} alt={`Page ${page.pageNumber}`} className="w-full h-full object-cover" />
                                               </div>
                                               <div className="flex justify-between items-center text-xs px-1">
                                                   <span className="font-bold">Pg {page.pageNumber}</span>
                                                   <span className="text-gray-500">{page.date}</span>
                                               </div>
                                               <button 
                                                    onClick={() => { if(window.confirm('Delete this page?')) deleteEPaperPage(page.id); }}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded shadow opacity-100 hover:bg-red-700 transition-opacity"
                                               >
                                                   <Trash2 size={14} />
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                      </div>
                  )}

                  {/* --- PUBLISHERS TAB --- */}
                  {activeTab === 'publishers' && isAdmin && (
                      <div className="animate-in fade-in duration-500">
                           <div className="flex items-center justify-between mb-6">
                             <h3 className="font-serif font-bold text-xl text-gray-700 flex items-center gap-2">
                                 <Users className="text-gold-dark"/> Manage Publishers
                             </h3>
                           </div>
                           
                           {/* Mobile Card View */}
                           <div className="md:hidden space-y-4">
                               {publisherUsers.length === 0 ? <p className="text-center text-gray-500 italic">No publishers found.</p> : publisherUsers.map(user => (
                                   <div key={user.id} className="bg-white p-4 border rounded shadow-sm">
                                       <div className="flex justify-between items-start mb-2">
                                           <div>
                                               <h4 className="font-bold text-ink">{user.name}</h4>
                                               <p className="text-xs text-gray-500">{user.email}</p>
                                           </div>
                                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                               {user.status}
                                           </span>
                                       </div>
                                       <div className="text-[10px] text-gray-400 mb-3">Joined: {user.joinedAt}</div>
                                       <div className="flex justify-end gap-2 border-t pt-3">
                                           <button onClick={() => toggleUserStatus(user.id)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${user.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                               {user.status === 'active' ? 'Block' : 'Activate'}
                                           </button>
                                           <button onClick={() => { if(window.confirm('Permanently delete this user?')) deleteUser(user.id); }} className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-xs font-bold uppercase">
                                               Delete
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>

                           {/* Desktop Table View */}
                           <div className="hidden md:block bg-white shadow-sm border border-gray-200 overflow-hidden rounded-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold uppercase text-gray-600 tracking-wider">
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Joined</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {publisherUsers.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">No publishers found.</td></tr>
                                        ) : (
                                            publisherUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 font-bold text-ink text-sm">{user.name}</td>
                                                    <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></td>
                                                    <td className="p-4 text-sm text-gray-500">{user.joinedAt}</td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button onClick={() => toggleUserStatus(user.id)} className={`p-2 rounded transition-colors ${user.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`} title={user.status === 'active' ? 'Block/Suspend' : 'Activate/Approve'}><Power size={16}/></button>
                                                        <button onClick={() => { if(window.confirm('Permanently delete this user?')) deleteUser(user.id); }} className="p-2 bg-red-100 text-red-600 rounded" title="Delete"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                           </div>
                      </div>
                  )}

                  {/* --- ADMINS TAB --- */}
                  {activeTab === 'admins' && isChiefEditor && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                           <div className="bg-white p-6 shadow-sm border-t-4 border-ink rounded-sm">
                                <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2">
                                    <ShieldAlert size={20}/> Create Admin
                                </h3>
                                <form onSubmit={handleCreateAdmin} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                                        <input type="text" required className="w-full border p-2 text-sm focus:ring-1 focus:ring-ink outline-none" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                                        <input type="email" required className="w-full border p-2 text-sm focus:ring-1 focus:ring-ink outline-none" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
                                        <input type="password" required className="w-full border p-2 text-sm focus:ring-1 focus:ring-ink outline-none" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} />
                                    </div>
                                    <button type="submit" className="w-full bg-ink text-white py-3 font-bold uppercase text-xs hover:bg-gray-800 transition-colors tracking-widest">
                                        Grant Access
                                    </button>
                                </form>
                           </div>
                           <div className="md:col-span-2">
                                <h3 className="font-serif font-bold text-xl mb-4 text-gray-700">Administrators</h3>
                                <div className="bg-white shadow-sm border border-gray-200 rounded-sm">
                                     {adminUsers.map(admin => (
                                         <div key={admin.id} className="p-4 border-b last:border-0 flex justify-between items-center">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                    <Shield size={20} />
                                                 </div>
                                                 <div>
                                                     <h4 className="font-bold text-sm text-ink">{admin.name} {admin.id === CHIEF_EDITOR_ID && <span className="text-gold-dark text-[10px] uppercase">(Chief)</span>}</h4>
                                                     <p className="text-xs text-gray-500">{admin.email}</p>
                                                 </div>
                                             </div>
                                             {admin.id !== CHIEF_EDITOR_ID && (
                                                 <button onClick={() => { if(window.confirm('Revoke admin access?')) deleteUser(admin.id); }} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase border border-red-200 px-3 py-1 rounded hover:bg-red-50">Revoke</button>
                                             )}
                                         </div>
                                     ))}
                                </div>
                           </div>
                      </div>
                  )}

                  {/* --- APPROVALS TAB --- */}
                  {activeTab === 'approvals' && isChiefEditor && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                          
                          {/* Pending Articles */}
                          <div className="bg-white p-4 md:p-6 shadow-sm border border-gray-200 rounded-sm">
                              <h3 className="font-serif font-bold text-lg mb-4 text-gray-700 flex items-center gap-2">
                                  <FileText size={20}/> Pending Articles
                              </h3>
                              {pendingArticles.length === 0 ? <p className="text-gray-500 italic text-sm">No articles waiting for approval.</p> : (
                                  <div className="space-y-4">
                                      {pendingArticles.map(article => (
                                          <div key={article.id} className="border border-gray-200 p-4 rounded bg-gray-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                               <div className="flex gap-4">
                                                   <img src={article.imageUrl} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded bg-gray-200" alt="" />
                                                   <div>
                                                       <h4 className="font-bold text-ink">{article.title}</h4>
                                                       <p className="text-xs text-gray-500 mb-1">By {article.author} • {article.date}</p>
                                                       <p className="text-sm text-gray-600 line-clamp-1">{article.excerpt}</p>
                                                   </div>
                                               </div>
                                               <div className="flex gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                                                   <Link to={`/article/${article.id}`} target="_blank" className="flex-1 md:flex-none text-center bg-gray-200 text-gray-700 px-3 py-2 rounded font-bold text-xs uppercase hover:bg-gray-300">Preview</Link>
                                                   <button onClick={() => approveContent('article', article.id)} className="flex-1 md:flex-none bg-green-600 text-white px-3 py-2 rounded font-bold text-xs uppercase hover:bg-green-700">Approve</button>
                                                   <button onClick={() => rejectContent('article', article.id)} className="flex-1 md:flex-none bg-red-600 text-white px-3 py-2 rounded font-bold text-xs uppercase hover:bg-red-700">Reject</button>
                                               </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>

                          {/* Pending Publishers */}
                          <div className="bg-white p-4 md:p-6 shadow-sm border border-gray-200 rounded-sm">
                              <h3 className="font-serif font-bold text-lg mb-4 text-gray-700 flex items-center gap-2">
                                  <Users size={20}/> Pending Publisher Requests
                              </h3>
                               {publisherUsers.filter(u => u.status === 'pending').length === 0 ? <p className="text-gray-500 italic text-sm">No pending requests.</p> : (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {publisherUsers.filter(u => u.status === 'pending').map(user => (
                                           <div key={user.id} className="border p-4 rounded flex justify-between items-center bg-yellow-50 border-yellow-200">
                                               <div>
                                                   <h4 className="font-bold text-sm">{user.name}</h4>
                                                   <p className="text-xs text-gray-600">{user.email}</p>
                                               </div>
                                               <div className="flex gap-2">
                                                   <button onClick={() => toggleUserStatus(user.id)} className="text-green-600 hover:bg-green-100 p-2 rounded"><CheckCircle size={20}/></button>
                                                   <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:bg-red-100 p-2 rounded"><X size={20}/></button>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                          </div>
                      </div>
                  )}

                  {/* --- INBOX TAB --- */}
                  {activeTab === 'inbox' && isChiefEditor && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px] animate-in fade-in duration-500">
                        <div className="lg:col-span-1 border-r border-gray-200 pr-0 lg:pr-8 overflow-y-auto">
                             <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2">
                                 <Inbox size={20} /> Messages ({contactMessages.length})
                             </h3>
                             <div className="space-y-2">
                                 {contactMessages.length === 0 && <p className="text-gray-400 text-sm">No messages yet.</p>}
                                 {contactMessages.sort((a,b) => b.timestamp - a.timestamp).map(msg => (
                                     <div key={msg.id} className={`p-4 border rounded cursor-pointer transition-colors hover:bg-gray-50 ${!msg.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`} onClick={() => markMessageAsRead(msg.id)}>
                                         <div className="flex justify-between items-center mb-1">
                                             <span className={`text-sm font-bold ${!msg.read ? 'text-ink' : 'text-gray-600'}`}>{msg.name}</span>
                                             <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                         </div>
                                         <p className={`text-xs truncate ${!msg.read ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{msg.subject}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <div className="lg:col-span-3 bg-white border border-gray-200 rounded shadow-sm p-8 overflow-y-auto">
                             <h4 className="text-xs font-bold uppercase text-gray-400 mb-6 border-b pb-2">All Messages</h4>
                             <div className="space-y-8">
                                 {contactMessages.length === 0 && <div className="text-center text-gray-400 py-12">Select a message to read.</div>}
                                 {contactMessages.sort((a,b) => b.timestamp - a.timestamp).map(msg => (
                                     <div key={msg.id} className="border-b border-gray-100 pb-8 last:border-0">
                                         <div className="flex justify-between items-start mb-4">
                                             <div>
                                                 <h3 className="font-bold text-lg text-ink">{msg.subject}</h3>
                                                 <p className="text-sm text-gray-500">From: <span className="font-bold text-gray-700">{msg.name}</span> &lt;{msg.email}&gt;</p>
                                             </div>
                                             <div className="flex items-center gap-4">
                                                 <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                                                 <button onClick={() => { if(window.confirm('Delete this message?')) deleteMessage(msg.id); }} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                             </div>
                                         </div>
                                         <div className="bg-gray-50 p-6 rounded text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-wrap">
                                             {msg.message}
                                         </div>
                                         <div className="mt-4 flex justify-end">
                                             <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-gold hover:text-ink transition-colors">
                                                 <Mail size={14} /> Reply
                                             </a>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                  )}

                  {/* --- ANALYTICS TAB --- */}
                  {activeTab === 'analytics' && isAdmin && (
                      <AnalyticsDashboard />
                  )}

                  {/* --- SUBSCRIBERS TAB --- */}
                  {activeTab === 'subscribers' && isAdmin && (
                      <div className="animate-in fade-in duration-500">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="font-serif font-bold text-xl text-gray-700 flex items-center gap-2">
                                <Users className="text-gold-dark"/> Subscriber Base
                            </h3>
                          </div>
                           
                           {/* Mobile Card View */}
                           <div className="md:hidden space-y-4">
                               {subscriberUsers.length === 0 ? <p className="text-center text-gray-500 italic">No subscribers yet.</p> : subscriberUsers.map(user => (
                                   <div key={user.id} className="bg-white p-4 border rounded shadow-sm">
                                       <div className="flex justify-between items-start mb-1">
                                           <span className="font-bold text-ink">{user.name}</span>
                                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                                       </div>
                                       <p className="text-xs text-gray-500 mb-2">{user.email}</p>
                                       <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded mb-3">
                                           <span className="text-gold-dark font-bold uppercase">{user.subscriptionPlan || 'free'}</span>
                                           <span className={user.isAdFree || user.subscriptionPlan === 'premium' ? "text-green-600" : "text-gray-500"}>
                                               {user.isAdFree || user.subscriptionPlan === 'premium' ? "Ads OFF" : "Ads ON"}
                                           </span>
                                       </div>
                                       <div className="flex justify-end gap-2">
                                            <button onClick={() => toggleUserAdStatus(user.id)} className={`p-2 rounded transition-colors ${user.isAdFree ? 'bg-gray-200 text-gray-600' : 'bg-purple-100 text-purple-600'}`} title="Toggle Ads"><MonitorOff size={16} /></button>
                                            <button onClick={() => toggleUserSubscription(user.id)} className={`p-2 rounded transition-colors ${user.subscriptionPlan === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`} title="Change Plan"><Star size={16} fill={user.subscriptionPlan === 'premium' ? "currentColor" : "none"} /></button>
                                            <button onClick={() => toggleUserStatus(user.id)} className={`p-2 rounded transition-colors ${user.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`} title="Block/Unblock"><Ban size={16} /></button>
                                            <button onClick={() => { if(window.confirm('Remove this subscriber?')) deleteUser(user.id); }} className="p-2 bg-red-100 text-red-600 rounded" title="Remove"><Trash2 size={16} /></button>
                                       </div>
                                   </div>
                               ))}
                           </div>

                           {/* Desktop Table View */}
                           <div className="hidden md:block bg-white shadow-sm border border-gray-200 overflow-hidden rounded-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold uppercase text-gray-600 tracking-wider">
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Ads</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subscriberUsers.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No subscribers yet.</td></tr>
                                    ) : (
                                        subscriberUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-bold text-ink text-sm">{user.name}</td>
                                                <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="p-4 text-xs font-bold uppercase text-gold-dark">{user.subscriptionPlan || 'free'}</td>
                                                <td className="p-4 text-xs font-bold uppercase">
                                                    {user.isAdFree || user.subscriptionPlan === 'premium' ? (
                                                        <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded">Off</span>
                                                    ) : (
                                                        <span className="text-gray-500 bg-gray-200 px-2 py-0.5 rounded">On</span>
                                                    )}
                                                </td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => toggleUserAdStatus(user.id)} className={`p-2 rounded transition-colors ${user.isAdFree ? 'bg-gray-200 text-gray-600' : 'bg-purple-100 text-purple-600'}`} title={user.isAdFree ? "Enable Ads" : "Disable Ads"}><MonitorOff size={16} /></button>
                                                    <button onClick={() => toggleUserSubscription(user.id)} className={`p-2 rounded transition-colors ${user.subscriptionPlan === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`} title={user.subscriptionPlan === 'premium' ? "Downgrade to Free" : "Upgrade to Premium"}><Star size={16} fill={user.subscriptionPlan === 'premium' ? "currentColor" : "none"} /></button>
                                                    <button onClick={() => toggleUserStatus(user.id)} className={`p-2 rounded transition-colors ${user.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`} title="Block/Unblock"><Ban size={16} /></button>
                                                    <button onClick={() => { if(window.confirm('Remove this subscriber?')) deleteUser(user.id); }} className="p-2 bg-red-100 text-red-600 rounded" title="Remove"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                      </div>
                  )}
                  
                  {/* --- CLASSIFIEDS TAB --- */}
                  {activeTab === 'classifieds' && isAdmin && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                          <div className="lg:col-span-1">
                              <div className="bg-white p-6 shadow-sm border-t-4 border-gold rounded-sm">
                                  <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2"><Briefcase size={20}/> Post Classified</h3>
                                  <form onSubmit={handleClassifiedSubmit} className="space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                                          <select className="w-full border p-2 text-sm outline-none bg-white" value={classifiedForm.category} onChange={e => setClassifiedForm({...classifiedForm, category: e.target.value as any})}>
                                              <option value="Jobs">Jobs</option>
                                              <option value="Real Estate">Real Estate</option>
                                              <option value="Education">Education</option>
                                              <option value="Services">Services</option>
                                              <option value="Vehicles">Vehicles</option>
                                              <option value="Public Notice">Public Notice</option>
                                              <option value="Matrimonial">Matrimonial</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Headline</label>
                                          <input required type="text" className="w-full border p-2 text-sm outline-none" placeholder="e.g. Sales Manager Required" value={classifiedForm.title} onChange={e => setClassifiedForm({...classifiedForm, title: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ad Content</label>
                                          <textarea required rows={4} className="w-full border p-2 text-sm outline-none resize-none" placeholder="Description of the ad..." value={classifiedForm.description} onChange={e => setClassifiedForm({...classifiedForm, description: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Info</label>
                                          <input required type="text" className="w-full border p-2 text-sm outline-none" placeholder="Phone or Email" value={classifiedForm.contact} onChange={e => setClassifiedForm({...classifiedForm, contact: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Location (Optional)</label>
                                          <input type="text" className="w-full border p-2 text-sm outline-none" placeholder="City or Area" value={classifiedForm.location} onChange={e => setClassifiedForm({...classifiedForm, location: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Image (Optional)</label>
                                          <div className="border border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                              <input type="file" accept="image/*" onChange={handleClassifiedImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                              <span className="text-xs text-gray-500 flex flex-col items-center">
                                                  <ImageIcon size={16} className="mb-1" />
                                                  {classifiedForm.imageUrl ? "Image Selected (Click to change)" : "Upload Image"}
                                              </span>
                                          </div>
                                          {classifiedForm.imageUrl && <img src={classifiedForm.imageUrl} className="mt-2 w-full h-24 object-contain border bg-gray-50" alt="Preview"/>}
                                      </div>
                                      <button type="submit" className="w-full bg-ink text-white py-3 font-bold hover:bg-gold hover:text-ink transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                          Post Ad
                                      </button>
                                  </form>
                              </div>
                          </div>
                          <div className="lg:col-span-2">
                              <h3 className="font-serif font-bold text-xl mb-4 text-gray-700">Active Classifieds</h3>
                              <div className="space-y-4">
                                  {classifieds.length === 0 && <p className="text-gray-500 italic">No classifieds posted.</p>}
                                  {classifieds.sort((a,b) => b.timestamp - a.timestamp).map(ad => (
                                      <div key={ad.id} className="bg-white p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between gap-4">
                                          
                                          {/* Thumbnail */}
                                          {ad.imageUrl && (
                                            <div className="w-full md:w-24 h-24 bg-gray-100 flex-shrink-0 border border-gray-200">
                                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                            </div>
                                          )}

                                          <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-[10px] uppercase font-bold rounded">{ad.category}</span>
                                                  <span className="text-[10px] text-gray-400">{new Date(ad.timestamp).toLocaleDateString()}</span>
                                              </div>
                                              <h4 className="font-bold text-ink">{ad.title}</h4>
                                              <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-bold">
                                                  <span>Contact: {ad.contact}</span>
                                                  {ad.location && <span>Location: {ad.location}</span>}
                                              </div>
                                          </div>
                                          <button onClick={() => deleteClassified(ad.id)} className="self-start md:self-center text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* --- CATEGORIES TAB --- */}
                  {activeTab === 'categories' && isAdmin && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                          <div className="lg:col-span-1">
                              <div className="bg-white p-6 shadow-sm border-t-4 border-gold rounded-sm">
                                  <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2"><Tag size={20}/> New Category</h3>
                                  <form onSubmit={handleCategoryAdd} className="space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category Name</label>
                                          <input 
                                              type="text" 
                                              required 
                                              placeholder="e.g. Health, Science" 
                                              className="w-full border p-2 text-sm outline-none focus:ring-1 focus:ring-gold"
                                              value={newCategoryName}
                                              onChange={e => setNewCategoryName(e.target.value)}
                                          />
                                      </div>
                                      <button type="submit" className="w-full bg-ink text-white py-3 font-bold hover:bg-gold hover:text-ink transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                          <Plus size={14} /> Add Category
                                      </button>
                                  </form>
                              </div>
                          </div>
                          <div className="lg:col-span-2">
                              <h3 className="font-serif font-bold text-xl mb-4 text-gray-700">Existing Categories</h3>
                              <div className="bg-white shadow-sm border border-gray-200 rounded-sm">
                                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {categories.map((cat, idx) => (
                                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded">
                                              <span className="font-bold text-sm text-ink">{cat}</span>
                                              <button 
                                                  onClick={() => { if(window.confirm(`Delete category "${cat}"? This will not delete associated articles.`)) deleteCategory(cat); }} 
                                                  className="text-gray-400 hover:text-red-500 p-1"
                                                  title="Delete Category"
                                              >
                                                  <Trash2 size={16} />
                                              </button>
                                          </div>
                                      ))}
                                      {categories.length === 0 && <p className="text-gray-500 text-sm italic col-span-2 text-center py-4">No categories defined.</p>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* --- ADS TAB --- */}
                  {activeTab === 'ads' && isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                        <div className="lg:col-span-4 space-y-6">
                             <div className="bg-white p-6 shadow-sm border-t-4 border-gold rounded-sm">
                                  <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2"><Megaphone size={20}/> {editingAdId ? 'Edit Campaign' : 'New Campaign'}</h3>
                                  <form onSubmit={handleAdSubmit} className="space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Advertiser Name</label>
                                          <input type="text" required className="w-full border p-2 text-sm outline-none" value={adForm.advertiserName || ''} onChange={e => setAdForm({...adForm, advertiserName: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Target URL</label>
                                          <input type="url" required className="w-full border p-2 text-sm outline-none" value={adForm.targetUrl || ''} onChange={e => setAdForm({...adForm, targetUrl: e.target.value})} />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Ad Size & Placement</label>
                                          <select className="w-full border p-2 text-sm outline-none bg-white" value={adForm.size || AdSize.RECTANGLE} onChange={e => setAdForm({...adForm, size: e.target.value as AdSize})}>
                                              <option value={AdSize.LEADERBOARD}>Leaderboard (728x90) - Top/Footer</option>
                                              <option value={AdSize.RECTANGLE}>Rectangle (300x250) - Sidebar/Content</option>
                                              <option value={AdSize.SKYSCRAPER}>Skyscraper (160x600) - Sidebar Sticky</option>
                                              <option value={AdSize.MOBILE_BANNER}>Mobile Banner (320x50)</option>
                                              <option value={AdSize.MOBILE_LARGE}>Mobile Large (320x100)</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Duration</label>
                                          <div className="flex gap-2">
                                              <input type="date" required className="w-full border p-2 text-sm outline-none" value={adForm.startDate || ''} onChange={e => setAdForm({...adForm, startDate: e.target.value})} />
                                              <input type="date" required className="w-full border p-2 text-sm outline-none" value={adForm.endDate || ''} onChange={e => setAdForm({...adForm, endDate: e.target.value})} />
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Creative Asset</label>
                                          <div className="flex gap-4 mb-2">
                                              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={adImageSourceType === 'url'} onChange={() => setAdImageSourceType('url')} className="accent-gold"/> <span className="text-xs">URL</span></label>
                                              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={adImageSourceType === 'upload'} onChange={() => setAdImageSourceType('upload')} className="accent-gold"/> <span className="text-xs">Upload</span></label>
                                          </div>
                                          {adImageSourceType === 'url' ? (
                                              <input type="text" placeholder="Image URL..." className="w-full border p-2 text-sm outline-none" value={adForm.imageUrl || ''} onChange={e => setAdForm({...adForm, imageUrl: e.target.value})} />
                                          ) : (
                                              <div className="border border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                                  <input type="file" accept="image/*" onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if(file) {
                                                          const reader = new FileReader();
                                                          reader.onloadend = () => setAdForm({...adForm, imageUrl: reader.result as string});
                                                          reader.readAsDataURL(file);
                                                      }
                                                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                  <span className="text-xs text-gray-500">Choose File</span>
                                              </div>
                                          )}
                                          {adForm.imageUrl && <img src={adForm.imageUrl} className="mt-2 w-full h-24 object-contain border bg-gray-50" alt="Preview"/>}
                                      </div>
                                      <div className="flex gap-2 pt-2">
                                          {editingAdId && <button type="button" onClick={handleCancelAdEdit} className="flex-1 bg-gray-200 text-gray-700 py-2 font-bold uppercase text-xs">Cancel</button>}
                                          <button type="submit" className="flex-1 bg-ink text-white py-2 font-bold uppercase text-xs hover:bg-gold hover:text-ink transition-colors">{editingAdId ? 'Update Campaign' : 'Launch Campaign'}</button>
                                      </div>
                                  </form>
                             </div>
                        </div>
                        <div className="lg:col-span-8">
                             <div className="bg-white shadow-sm border border-gray-200 rounded-sm">
                                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                      <h3 className="font-serif font-bold text-gray-700">Active Campaigns</h3>
                                      <span className="text-xs text-gray-500">{advertisements.length} Total</span>
                                  </div>
                                  <div className="divide-y divide-gray-100">
                                      {advertisements.length === 0 ? <div className="p-8 text-center text-gray-500">No active advertisements.</div> : advertisements.map(ad => (
                                          <div key={ad.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                              <div className="w-24 h-16 bg-gray-100 border border-gray-200 flex-shrink-0">
                                                  <img src={ad.imageUrl} className="w-full h-full object-cover" alt="" />
                                              </div>
                                              <div className="flex-1">
                                                  <h4 className="font-bold text-sm text-ink">{ad.advertiserName}</h4>
                                                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                      <span>Size: {ad.size}</span>
                                                      <span>Clicks: {ad.clicks || 0}</span>
                                                      <span>Ends: {ad.endDate}</span>
                                                      <span className={`uppercase font-bold ${ad.status === 'active' ? 'text-green-600' : ad.status === 'pending' ? 'text-yellow-600' : 'text-red-500'}`}>{ad.status}</span>
                                                  </div>
                                              </div>
                                              <div className="flex gap-2">
                                                  <button onClick={() => { setEditingAdId(ad.id); setAdForm(ad); setAdImageSourceType('url'); }} className="p-2 text-gray-500 hover:text-ink"><Edit size={16}/></button>
                                                  <button onClick={() => toggleAdStatus(ad.id)} className={`p-2 ${ad.status === 'active' ? 'text-orange-500' : 'text-green-500'}`} title={ad.status === 'active' ? 'Pause' : 'Resume'}><Power size={16}/></button>
                                                  <button onClick={() => { if(window.confirm('Delete this ad?')) deleteAdvertisement(ad.id); }} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                             </div>
                        </div>
                    </div>
                  )}

                  {/* --- SETTINGS TAB --- */}
                  {activeTab === 'settings' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                          
                          {/* Profile Update Section */}
                          <div className="bg-white p-8 shadow-sm border-t-4 border-gray-600 rounded-sm">
                              <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2">
                                   <Shield size={20}/> Profile & Security
                              </h3>
                              
                              {!isProfileVerifying ? (
                                  <form onSubmit={handleInitiateProfileUpdate} className="space-y-4">
                                      {/* Profile Picture Upload */}
                                      <div className="flex items-center gap-4 mb-4">
                                          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-300">
                                              {settingsProfilePic ? (
                                                  <img src={settingsProfilePic} alt="Profile" className="w-full h-full object-cover" />
                                              ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                      <Users size={32} />
                                                  </div>
                                              )}
                                          </div>
                                          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-ink text-xs font-bold uppercase px-4 py-2 rounded transition-colors">
                                              Upload Photo
                                              <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicUpload} />
                                          </label>
                                      </div>

                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Update Email Address</label>
                                          <input type="email" className="w-full border p-3 text-sm focus:ring-1 focus:ring-ink outline-none" value={settingsEmail} onChange={e => setSettingsEmail(e.target.value)}/>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Password</label>
                                          <input type="password" placeholder="Leave blank to keep current" className="w-full border p-3 text-sm focus:ring-1 focus:ring-ink outline-none" value={settingsPassword} onChange={e => setSettingsPassword(e.target.value)}/>
                                      </div>
                                      <div className="pt-4">
                                          <button type="submit" className="w-full bg-ink text-white py-3 font-bold hover:bg-gold hover:text-ink transition-colors uppercase tracking-widest text-xs">Request Update</button>
                                      </div>
                                  </form>
                              ) : (
                                  <form onSubmit={handleCompleteProfileUpdate} className="space-y-6 bg-gray-50 p-6 rounded border border-gold animate-in fade-in">
                                      <div className="text-center">
                                          <h4 className="font-bold text-ink">Verify Identity</h4>
                                          <p className="text-xs text-gray-500 mt-1">Enter code sent to {currentUser.email}</p>
                                      </div>
                                      <input type="text" required placeholder="Enter 6-digit code" className="w-full border-2 border-gold p-3 text-center text-lg font-bold tracking-widest focus:outline-none" value={profileVerificationCode} onChange={e => setProfileVerificationCode(e.target.value)}/>
                                      <div className="flex gap-2">
                                          <button type="button" onClick={() => { setIsProfileVerifying(false); setProfileVerificationCode(''); }} className="flex-1 bg-gray-200 text-gray-600 py-3 font-bold uppercase text-xs hover:bg-gray-300">Cancel</button>
                                          <button type="submit" className="flex-1 bg-green-600 text-white py-3 font-bold uppercase text-xs hover:bg-green-700">Confirm Changes</button>
                                      </div>
                                  </form>
                              )}
                          </div>

                           <div className="flex flex-col gap-8">
                               {/* Read Only Info */}
                               <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-sm">
                                   <h3 className="font-serif font-bold text-xl mb-4 text-gray-700">Account Status</h3>
                                   <div className="space-y-4 text-sm">
                                       <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Role</span><span className="font-bold uppercase">{currentUser.role}</span></div>
                                       <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Member Since</span><span className="font-bold">{currentUser.joinedAt}</span></div>
                                       <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Status</span><span className="font-bold text-green-600 uppercase flex items-center gap-1"><CheckCircle size={14}/> {currentUser.status}</span></div>
                                   </div>
                               </div>

                                {/* Email Configuration (ADMIN ONLY) */}
                                {isAdmin && (
                                    <div className="bg-white p-8 shadow-sm border-l-4 border-l-blue-500 rounded-sm">
                                        <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2"><Mail size={20}/> Email Configuration</h3>
                                        <form onSubmit={handleEmailSettingsSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Service API Key</label>
                                                <input type="password" required className="w-full border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={emailApiKey} onChange={e => setEmailApiKey(e.target.value)}/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sender Email ID</label>
                                                <input type="email" required className="w-full border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={emailSender} onChange={e => setEmailSender(e.target.value)}/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Company Name</label>
                                                <input type="text" required className="w-full border p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={emailCompany} onChange={e => setEmailCompany(e.target.value)}/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Template</label>
                                                <textarea required rows={4} className="w-full border p-2 text-sm font-mono text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none" value={emailTemplate} onChange={e => setEmailTemplate(e.target.value)}/>
                                            </div>
                                            <button type="submit" className="w-full bg-blue-600 text-white py-2 font-bold hover:bg-blue-700 transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Save size={14} /> Save Configuration</button>
                                        </form>
                                    </div>
                                )}

                                {/* Ad Settings Configuration (ADMIN ONLY) */}
                                {isAdmin && (
                                     <div className="bg-white p-8 shadow-sm border-l-4 border-l-purple-500 rounded-sm">
                                          <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2"><Megaphone size={20}/> Ad Configuration</h3>
                                          <form onSubmit={handleAdSettingsSubmit} className="space-y-4">
                                              <div className="flex items-center justify-between">
                                                  <label className="text-sm font-bold text-gray-600">Enable Ads Globally</label>
                                                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                      <input type="checkbox" checked={globalAdsEnabled} onChange={e => setGlobalAdsEnabled(e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-purple-600"/>
                                                      <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${globalAdsEnabled ? 'bg-purple-600' : 'bg-gray-300'}`}></label>
                                                  </div>
                                              </div>
                                              <p className="text-[10px] text-gray-400 mt-2">
                                                  When disabled, ads will be hidden for ALL users (including guests). Premium subscribers never see ads regardless of this setting.
                                              </p>
                                              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 font-bold transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Save size={14} /> Update Ad Settings</button>
                                          </form>
                                     </div>
                                )}

                                {/* Subscription Settings (ADMIN ONLY) */}
                                {isAdmin && (
                                    <div className="bg-white p-8 shadow-sm border-l-4 border-l-gold rounded-sm">
                                         <h3 className="font-serif font-bold text-xl mb-4 text-gray-700 flex items-center gap-2"><DollarSign size={20}/> Subscription Settings</h3>
                                         <form onSubmit={handleSubscriptionSettingsSubmit} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-600">Enable Payment Banner & Button</label>
                                                <input type="checkbox" checked={subShowPayment} onChange={e => setSubShowPayment(e.target.checked)} className="w-5 h-5 accent-gold cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Monthly Price Display</label>
                                                <input type="text" className="w-full border p-2 text-sm outline-none" value={subPrice} onChange={e => setSubPrice(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Payment Link (PayPal/Stripe URL)</label>
                                                <input type="text" className="w-full border p-2 text-sm outline-none" value={subPaymentLink} onChange={e => setSubPaymentLink(e.target.value)} />
                                            </div>
                                            <button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white py-2 font-bold transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2"><CreditCard size={14} /> Update Payment Settings</button>
                                         </form>
                                         <p className="text-[10px] text-gray-400 mt-2">
                                            Note: Disabling the payment banner will hide the payment section on the Subscribe page, allowing for free-only registrations.
                                         </p>
                                    </div>
                                )}
                           </div>
                      </div>
                  )}
              </div>
          </div>
      </main>
    </div>
  );
};
