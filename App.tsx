
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { NewsProvider } from './context/NewsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { EPaper } from './pages/EPaper';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { PublisherRegister } from './pages/PublisherRegister';
import { Subscribe } from './pages/Subscribe';
import { ArticleDetail } from './pages/ArticleDetail';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Classifieds } from './pages/Classifieds';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isEPaperReader = location.pathname === '/epaper';

  return (
    <div className="flex flex-col min-h-screen font-sans text-ink bg-paper selection:bg-gold/30">
      {!isEPaperReader && <Header />}
      {/* If E-Paper reader, we hide standard header to maximize screen space, or show a minimal one (handled in EPaper component) */}
      
      <main className={`flex-grow ${isEPaperReader ? '' : 'pt-4'}`}>
        {children}
      </main>

      {!isEPaperReader && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NewsProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/epaper" element={<EPaper />} />
            <Route path="/classifieds" element={<Classifieds />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/publisher/register" element={<PublisherRegister />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Fallback route */}
            <Route path="*" element={<div className="p-20 text-center">Page not found</div>} />
          </Routes>
        </Layout>
      </HashRouter>
    </NewsProvider>
  );
};

export default App;
