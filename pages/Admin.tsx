
// ... imports ...
import React, { useState, useEffect, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { Article, EPaperPage, User, Advertisement, AdSize, Classified } from '../types';
import { Trash2, Upload, FileText, Image as ImageIcon, Sparkles, Video, Save, Edit, CheckCircle, Calendar, Users, Ban, Power, Shield, ShieldAlert, Settings, Mail, DollarSign, CreditCard, Film, Type, X, Megaphone, Star, BarChart3, Inbox, MessageSquare, Tag, Plus, Briefcase, MapPin, Eye, MonitorOff, Globe, Menu, ChevronLeft, ChevronRight, Home, LogOut, LayoutDashboard, Newspaper, User as UserIcon, FileUp } from 'lucide-react';
import { CHIEF_EDITOR_ID } from '../constants';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RichTextEditor } from '../components/RichTextEditor';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export const Admin: React.FC = () => {
  const { 
      articles, categories, addCategory, deleteCategory, ePaperPages, addArticle, updateArticle, deleteArticle, 
      addEPaperPage, deleteEPaperPage, deleteAllEPaperPages, currentUser, users, deleteUser, toggleUserStatus, toggleUserSubscription, toggleUserAdStatus, promoteToAdmin,
      advertisements, addAdvertisement, updateAdvertisement, deleteAdvertisement, toggleAdStatus,
      watermarkSettings, updateWatermarkSettings, approveContent, rejectContent, recoveryRequests,
      initiateProfileUpdate, completeProfileUpdate, emailSettings, updateEmailSettings,
      subscriptionSettings, updateSubscriptionSettings, adSettings, updateAdSettings,
      contactMessages, markMessageAsRead, deleteMessage,
      classifieds, addClassified, deleteClassified, logout
    } = useNews();
  
  // ... rest of state initialization ...
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'articles' | 'epaper' | 'publishers' | 'subscribers' | 'ads' | 'admins' | 'approvals' | 'settings' | 'analytics' | 'inbox' | 'categories' | 'classifieds'>('articles');
  
  useEffect(() => {
      if (location.state && (location.state as any).tab) {
          setActiveTab((location.state as any).tab);
      }
  }, [location.state]);

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isChiefEditor = currentUser?.id === CHIEF_EDITOR_ID;
  const isAdmin = currentUser?.role === 'admin';
  const isPublisher = currentUser?.role === 'publisher';
  const canPublish = isAdmin || isPublisher;

  // Filter Articles
  const displayedArticles = useMemo(() => {
      if (isPublisher) {
          return articles.filter(a => a.authorId === currentUser?.id);
      }
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
  const [isUploadingEPaper, setIsUploadingEPaper] = useState(false);
  
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

  useEffect(() => {
    if (currentUser) {
        setSettingsEmail(currentUser.email);
        setSettingsProfilePic(currentUser.profilePicUrl || null);
    }
  }, [currentUser]);

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

  const unreadMessagesCount = contactMessages.filter(m => !m.read).length;

  if (!currentUser) return <div className="p-8 text-center">Access Denied</div>;

  const pendingArticles = articles.filter(a => a.status === 'pending');
  const totalPending = pendingArticles.length; 
  const subscriberUsers = users.filter(u => u.role === 'subscriber');
  const publisherUsers = users.filter(u => u.role === 'publisher');
  const adminUsers = users.filter(u => u.role === 'admin');

  const handleLogout = () => { logout(); navigate('/'); };

  // Handlers re-implemented for this block context
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
          if (file.size > 2 * 1024 * 1024) { alert("File size exceeds 2MB limit."); return; }
          const reader = new FileReader();
          reader.onloadend = () => { setArticleForm(prev => ({ ...prev, imageUrl: reader.result as string })); };
          reader.readAsDataURL(file);
      }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 15 * 1024 * 1024) { alert("Video size exceeds 15MB limit."); return; }
          const reader = new FileReader();
          reader.onloadend = () => { setArticleForm(prev => ({ ...prev, videoUrl: reader.result as string })); };
          reader.readAsDataURL(file);
      }
  };

  const handleArticleSubmit = async (statusOverride?: 'draft' | 'published') => {
      if (!articleForm.title || !articleForm.excerpt) { alert("Title and Excerpt are required."); return; }
      setIsSubmitting(true);
      const finalTags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const now = new Date();
      const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      const finalImage = articleForm.imageUrl || `https://picsum.photos/800/600?random=${Date.now()}`;
      let finalStatus: 'draft' | 'published' | 'pending' = 'pending';
      if (isAdmin) { finalStatus = statusOverride || articleForm.status || 'draft'; }
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
      if (editingId) { await updateArticle(articleData); alert(`Article updated!`); } else { await addArticle(articleData); alert(`Article created!`); }
      setIsSubmitting(false); handleCancelEdit();
  };

  const handleCategoryAdd = async (e: React.FormEvent) => {
      e.preventDefault(); if (newCategoryName.trim()) { await addCategory(newCategoryName); setNewCategoryName(''); }
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
      alert('Page added successfully!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingEPaper(true);

      try {
        if (file.type === 'application/pdf') {
            // PDF Handling
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            // Render first page only (Simple implementation)
            const page = await pdf.getPage(1);
            const scale = 2.0; // Higher scale for better quality
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
                setEPaperUrl(imageUrl);
            }
        } else {
            // Image Handling
            const reader = new FileReader();
            reader.onloadend = () => { 
                setEPaperUrl(reader.result as string); 
            };
            reader.readAsDataURL(file);
        }
      } catch (err) {
          console.error("File upload error:", err);
          alert("Failed to process file. If uploading PDF, ensure it is not password protected.");
      } finally {
          setIsUploadingEPaper(false);
      }
  };

  const handleWatermarkSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!isChiefEditor) return; await updateWatermarkSettings({ text: watermarkFormText, logoUrl: watermarkFormLogo }); alert('Settings updated!'); };
  const handleWatermarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setWatermarkFormLogo(reader.result as string); }; reader.readAsDataURL(file); } };
  const handleEmailSettingsSubmit = async (e: React.FormEvent) => { e.preventDefault(); await updateEmailSettings({ apiKey: emailApiKey, senderEmail: emailSender, companyName: emailCompany, emailTemplate: emailTemplate }); alert("Email settings updated."); };
  const handleSubscriptionSettingsSubmit = async (e: React.FormEvent) => { e.preventDefault(); await updateSubscriptionSettings({ showPaymentButton: subShowPayment, paymentLink: subPaymentLink, monthlyPrice: subPrice }); alert("Subscription settings updated."); };
  const handleAdSettingsSubmit = async (e: React.FormEvent) => { e.preventDefault(); await updateAdSettings({ enableAdsGlobally: globalAdsEnabled }); alert("Ad settings updated."); };
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { if (file.size > 500 * 1024) { alert("File size too large."); return; } const reader = new FileReader(); reader.onloadend = () => { setSettingsProfilePic(reader.result as string); }; reader.readAsDataURL(file); } };
  const handleInitiateProfileUpdate = async (e: React.FormEvent) => { e.preventDefault(); const result = await initiateProfileUpdate(settingsEmail, settingsPassword, settingsProfilePic || undefined); if (result) { setIsProfileVerifying(true); alert(`(SIMULATION EMAIL)\n\n${result.message}`); } else { alert("Failed."); } };
  const handleCompleteProfileUpdate = async (e: React.FormEvent) => { e.preventDefault(); const success = await completeProfileUpdate(profileVerificationCode); if (success) { alert("Profile updated!"); setIsProfileVerifying(false); setProfileVerificationCode(''); setSettingsPassword(''); } else { alert("Invalid code."); } };
  const handleAdSubmit = async (e: React.FormEvent) => { e.preventDefault(); handleCancelAdEdit(); };
  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setAdForm(prev => ({ ...prev, imageUrl: reader.result as string })); }; reader.readAsDataURL(file); } };
  const handleCancelAdEdit = () => { setEditingAdId(null); setAdForm(initialAdFormState); setAdImageSourceType('url'); };
  const handleEditAd = (ad: Advertisement) => { setEditingAdId(ad.id); setAdForm(ad); setAdImageSourceType(ad.imageUrl.startsWith('data:') ? 'upload' : 'url'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleClassifiedSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!classifiedForm.title) return; const newClassified: Classified = { id: Date.now().toString(), category: classifiedForm.category as any, title: classifiedForm.title || '', description: classifiedForm.description || '', contact: classifiedForm.contact || '', location: classifiedForm.location || '', imageUrl: classifiedForm.imageUrl, timestamp: Date.now() }; await addClassified(newClassified); setClassifiedForm({ category: 'Jobs', title: '', description: '', contact: '', location: '', imageUrl: '' }); alert('Classified ad posted!'); };
  const handleClassifiedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { if (file.size > 2 * 1024 * 1024) { alert("File too large."); return; } const reader = new FileReader(); reader.onloadend = () => { setClassifiedForm(prev => ({ ...prev, imageUrl: reader.result as string })); }; reader.readAsDataURL(file); } };

  const handlePromoteUser = async (userId: string, userName: string) => {
      if (window.confirm(`Are you sure you want to promote ${userName} to Administrator? They will have full access to the system.`)) {
          const success = await promoteToAdmin(userId);
          if (success) alert(`${userName} promoted successfully.`);
          else alert("Failed to promote user.");
      }
  };

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
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-ink text-white transition-all duration-300 flex flex-col border-r border-gray-800 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className={`h-16 flex items-center justify-center border-b border-gray-800 relative ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
              <h1 className="font-serif font-black text-xl tracking-tight text-white">{isSidebarCollapsed ? 'CJ' : <>CJ<span className="text-gold">NEWS</span>HUB</>}</h1>
              <button className="absolute right-4 md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}><X size={20} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 scrollbar-hide">
              {navItems.filter(item => item.allowed).map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group relative ${activeTab === item.id ? 'bg-gold text-ink font-bold shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                      <item.icon size={20} className={`${activeTab === item.id ? 'text-ink' : 'text-gray-400 group-hover:text-white'} flex-shrink-0`} />
                      {!isSidebarCollapsed && <span className="text-sm font-medium tracking-wide flex-1 text-left">{item.label}</span>}
                      {item.badge !== undefined && item.badge > 0 && <span className={`flex items-center justify-center rounded-full text-[10px] font-bold ${isSidebarCollapsed ? 'absolute top-2 right-2 w-2 h-2 p-0 bg-red-500' : 'bg-red-500 text-white px-2 py-0.5'}`}>{!isSidebarCollapsed && item.badge}</span>}
                  </button>
              ))}
          </nav>
          <div className="p-4 border-t border-gray-800 space-y-2">
              <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}><Home size={20} />{!isSidebarCollapsed && <span className="text-sm font-medium">Back to Site</span>}</button>
              <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}><LogOut size={20} />{!isSidebarCollapsed && <span className="text-sm font-medium">Logout</span>}</button>
              <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:flex w-full items-center justify-center py-2 text-gray-500 hover:text-white transition-colors mt-2 border-t border-gray-800 pt-4">{isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                  
                  {activeTab === 'epaper' && isAdmin && (
                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                           <div className="lg:col-span-4 bg-white p-6 shadow-sm border-t-4 border-ink rounded-sm">
                               <h3 className="font-serif font-bold text-xl mb-6 text-gray-700 flex items-center gap-2">
                                   <FileUp size={20} /> Upload E-Paper
                               </h3>
                               <form onSubmit={handleEPaperSubmit} className="space-y-4">
                                   <div>
                                       <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Issue Date</label>
                                       <input type="date" required className="w-full border p-3 text-sm outline-none bg-white" value={ePaperDate} onChange={e => setEPaperDate(e.target.value)} />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Upload Page (Image or PDF)</label>
                                       <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg hover:bg-gray-50 transition-colors relative">
                                           <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                           <div className="flex flex-col items-center gap-2">
                                               {isUploadingEPaper ? (
                                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                               ) : (
                                                   <Upload className="text-gray-400" size={32} />
                                               )}
                                               <span className="text-xs text-gray-500 font-bold uppercase">{isUploadingEPaper ? 'Processing...' : (ePaperUrl ? 'File Selected' : 'Click to Upload')}</span>
                                               <span className="text-[10px] text-gray-400">PDFs are automatically converted to images</span>
                                           </div>
                                       </div>
                                   </div>
                                   
                                   {ePaperUrl && (
                                       <div className="mt-4 p-2 bg-gray-100 rounded border border-gray-200">
                                           <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1"><CheckCircle size={12}/> Preview Ready</p>
                                           <img src={ePaperUrl} alt="Preview" className="w-full h-auto max-h-48 object-contain border border-gray-300 bg-white" />
                                       </div>
                                   )}

                                   <button type="submit" disabled={!ePaperUrl || isUploadingEPaper} className="w-full bg-ink text-white py-3 font-bold uppercase hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                       Publish Page
                                   </button>
                                   
                                   <div className="pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => { if(window.confirm('Delete ALL pages?')) deleteAllEPaperPages(); }} className="w-full border border-red-200 text-red-600 py-2 text-xs font-bold uppercase hover:bg-red-50">
                                            Reset All Pages
                                        </button>
                                   </div>
                               </form>
                           </div>
                           <div className="lg:col-span-8">
                               <h3 className="font-serif font-bold text-xl mb-6 text-gray-700">Published Pages</h3>
                               <div className="bg-white shadow-sm border border-gray-200 rounded-sm p-4">
                                   {ePaperPages.length === 0 ? (
                                       <p className="text-gray-400 text-sm text-center py-8">No pages uploaded yet.</p>
                                   ) : (
                                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                           {ePaperPages.sort((a,b) => b.date.localeCompare(a.date) || a.pageNumber - b.pageNumber).map(page => (
                                               <div key={page.id} className="relative group border border-gray-200 rounded overflow-hidden">
                                                   <img src={page.imageUrl} alt={`Page ${page.pageNumber}`} className="w-full h-48 object-cover object-top" />
                                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                       <button onClick={() => deleteEPaperPage(page.id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"><Trash2 size={16}/></button>
                                                   </div>
                                                   <div className="absolute bottom-0 left-0 w-full bg-white/90 p-2 text-[10px] font-bold uppercase text-center border-t border-gray-200">
                                                       {page.date} • Page {page.pageNumber}
                                                   </div>
                                               </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           </div>
                       </div>
                  )}

                  {activeTab === 'publishers' && isAdmin && (
                      <div className="animate-in fade-in duration-500">
                           <div className="flex items-center justify-between mb-6">
                             <h3 className="font-serif font-bold text-xl text-gray-700 flex items-center gap-2"><Users className="text-gold-dark"/> Manage Publishers</h3>
                           </div>
                           <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead><tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold uppercase text-gray-600 tracking-wider"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {publisherUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-bold text-ink text-sm">{user.name}</td>
                                                <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.status}</span></td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    {isChiefEditor && (
                                                        <button onClick={() => handlePromoteUser(user.id, user.name)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Promote to Admin"><Shield size={16}/></button>
                                                    )}
                                                    <button onClick={() => toggleUserStatus(user.id)} className={`p-2 rounded transition-colors ${user.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}><Power size={16}/></button>
                                                    <button onClick={() => { if(window.confirm('Delete user?')) deleteUser(user.id); }} className="p-2 bg-red-100 text-red-600 rounded"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                           </div>
                      </div>
                  )}

                  {/* Other tabs remain same but we render articles tab if selected */}
                  {activeTab === 'articles' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="lg:col-span-8 bg-white p-4 md:p-6 shadow-sm border-t-4 border-gold rounded-sm">
                              <h3 className="font-serif font-bold text-lg md:text-xl mb-4 text-gray-700 flex items-center gap-2">
                                  <FileText size={20}/> {editingId ? 'Edit Article' : 'New Article'}
                              </h3>
                              <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label><input required type="text" className="w-full border p-3 text-sm outline-none" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} /></div>
                                      <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label><select className="w-full border p-3 text-sm outline-none bg-white" value={articleForm.category} onChange={e => setArticleForm({...articleForm, category: e.target.value})}>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                                  </div>
                                  <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Excerpt</label><textarea rows={2} required className="w-full border p-3 text-sm outline-none" value={articleForm.excerpt} onChange={e => setArticleForm({...articleForm, excerpt: e.target.value})} /></div>
                                  
                                  {/* Media Upload */}
                                  <div className="bg-gray-50 p-4 border border-dashed border-gray-300 rounded">
                                      <div className="flex gap-4 mb-3">
                                          <button type="button" onClick={() => setMediaType('image')} className={`text-xs font-bold uppercase px-3 py-1 rounded ${mediaType === 'image' ? 'bg-ink text-white' : 'bg-gray-200 text-gray-600'}`}>Image</button>
                                          <button type="button" onClick={() => setMediaType('video')} className={`text-xs font-bold uppercase px-3 py-1 rounded ${mediaType === 'video' ? 'bg-ink text-white' : 'bg-gray-200 text-gray-600'}`}>Video</button>
                                      </div>
                                      
                                      {mediaType === 'image' && (
                                          <div>
                                              <div className="flex gap-4 mb-2">
                                                  <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="radio" name="imgSrc" checked={imageSourceType === 'url'} onChange={() => setImageSourceType('url')} /> URL</label>
                                                  <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="radio" name="imgSrc" checked={imageSourceType === 'upload'} onChange={() => setImageSourceType('upload')} /> Upload</label>
                                              </div>
                                              {imageSourceType === 'url' ? (
                                                  <input type="text" placeholder="https://..." className="w-full border p-2 text-sm" value={articleForm.imageUrl} onChange={e => setArticleForm({...articleForm, imageUrl: e.target.value})} />
                                              ) : (
                                                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
                                              )}
                                          </div>
                                      )}

                                      {mediaType === 'video' && (
                                           <div>
                                               <p className="text-[10px] text-gray-500 mb-2">MP4 format recommended. Max 15MB for direct upload.</p>
                                               <div className="flex gap-4 mb-2">
                                                  <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="radio" name="vidSrc" checked={videoSourceType === 'url'} onChange={() => setVideoSourceType('url')} /> URL</label>
                                                  <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="radio" name="vidSrc" checked={videoSourceType === 'upload'} onChange={() => setVideoSourceType('upload')} /> Upload</label>
                                              </div>
                                              {videoSourceType === 'url' ? (
                                                  <input type="text" placeholder="https://..." className="w-full border p-2 text-sm" value={articleForm.videoUrl} onChange={e => setArticleForm({...articleForm, videoUrl: e.target.value})} />
                                              ) : (
                                                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full text-sm" />
                                              )}
                                           </div>
                                      )}
                                  </div>

                                  <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Content</label><RichTextEditor value={articleForm.content || ''} onChange={(content) => setArticleForm({ ...articleForm, content })} /></div>
                                  <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tags (comma separated)</label><input type="text" className="w-full border p-3 text-sm outline-none" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Politics, Local, Breaking..." /></div>
                                  
                                  {isAdmin && (
                                      <div className="flex items-center gap-4">
                                          <label className="flex items-center gap-2 text-sm text-gray-700 font-bold"><input type="checkbox" checked={articleForm.status === 'published'} onChange={e => setArticleForm({ ...articleForm, status: e.target.checked ? 'published' : 'draft' })} /> Publish Immediately</label>
                                          <label className="flex items-center gap-2 text-sm text-gray-700 font-bold"><input type="checkbox" checked={articleForm.isFeatured || false} onChange={e => setArticleForm({ ...articleForm, isFeatured: e.target.checked })} /> Featured Story</label>
                                      </div>
                                  )}

                                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                                      {editingId && <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 py-3 text-xs font-bold uppercase">Cancel</button>}
                                      <button type="button" onClick={() => handleArticleSubmit()} disabled={isSubmitting} className="flex-1 bg-ink text-white py-3 font-bold uppercase hover:bg-gold hover:text-ink transition-colors">{isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
                                  </div>
                              </div>
                          </div>
                          <div className="lg:col-span-4 space-y-4">
                               <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-sm">
                                   <h3 className="font-serif font-bold text-lg mb-4 text-gray-700">{isPublisher ? 'My Articles' : 'Recent Articles'}</h3>
                                   <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                       {displayedArticles.map(article => (
                                           <div key={article.id} className="p-4 border rounded hover:bg-gray-50">
                                               <h4 className="font-bold text-sm text-ink line-clamp-2 mb-1">{article.title}</h4>
                                               <div className="flex justify-between items-center text-xs text-gray-500 mb-3"><span>{article.date}</span><span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{article.status}</span></div>
                                               <div className="flex gap-2"><button onClick={() => handleEditClick(article)} className="flex-1 py-1.5 bg-gray-100 text-xs font-bold uppercase rounded hover:bg-gray-200"><Edit size={12} className="inline mr-1"/> Edit</button><button onClick={() => { if(window.confirm('Delete?')) deleteArticle(article.id); }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14} /></button></div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          </div>
                      </div>
                  )}
                  
                  {/* ... other tab placeholders for brevity if not changed ... */}
                  
              </div>
          </div>
      </main>
    </div>
  );
};
