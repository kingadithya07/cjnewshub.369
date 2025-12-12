
import React from 'react';
import { AdSpace } from './AdSpace';
import { AdSize } from '../types';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

export const Footer: React.FC = () => {
  const { showAds } = useNews();

  return (
    <footer className="bg-ink text-white pt-8 pb-8 border-t-4 border-gold mt-auto">
      {/* Footer Ad Unit */}
      {showAds && (
          <div className="w-full flex justify-center pb-8 border-b border-gray-800 mb-8 px-4">
             <div className="bg-white/5 p-2 rounded">
                <AdSpace size={AdSize.LEADERBOARD} label="Partner Advertisement" className="my-0" />
             </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">CJ<span className="text-gold">NEWS</span>HUB</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
                Delivering truthful, unbiased, and critical journalism to the global community since 2025. We stand for integrity in the digital age.
            </p>
        </div>
        
        <div>
            <h3 className="text-gold font-sans font-bold text-xs tracking-widest uppercase mb-6">Sections</h3>
            <ul className="space-y-2 text-sm text-gray-300 font-serif">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/epaper" className="hover:text-white transition-colors">E-Paper</Link></li>
                <li><Link to="/category/world" className="hover:text-white transition-colors">World Politics</Link></li>
                <li><Link to="/category/business" className="hover:text-white transition-colors">Business & Tech</Link></li>
            </ul>
        </div>

        <div>
            <h3 className="text-gold font-sans font-bold text-xs tracking-widest uppercase mb-6">Support</h3>
            <ul className="space-y-2 text-sm text-gray-300 font-serif">
                <li>
                    <Link to="/contact" state={{ subject: 'General Support Inquiry' }} className="hover:text-white transition-colors">
                        Contact Us
                    </Link>
                </li>
                <li>
                    <Link to="/subscribe" className="hover:text-white transition-colors">
                        Subscription Plans
                    </Link>
                </li>
                <li>
                    <Link to="/contact" state={{ subject: 'Advertising & Partnership Inquiry' }} className="hover:text-white transition-colors">
                        Advertise with Us
                    </Link>
                </li>
                <li>
                    <Link to="/privacy-policy" className="hover:text-white transition-colors">
                        Privacy Policy
                    </Link>
                </li>
            </ul>
        </div>

        <div>
            <h3 className="text-gold font-sans font-bold text-xs tracking-widest uppercase mb-6">Newsletter</h3>
            <p className="text-gray-400 text-xs mb-4">Get the latest headlines delivered to your inbox daily.</p>
            <div className="flex">
                <input type="email" placeholder="Your email" className="bg-gray-800 text-white px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-gold" />
                <button className="bg-gold text-ink px-4 py-2 text-xs font-bold hover:bg-white transition-colors">GO</button>
            </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white font-sans">
        <p>&copy; 2025 CJ News Hub. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0 font-bold">
            <span className="cursor-pointer hover:text-gold transition-colors">Twitter</span>
            <span className="cursor-pointer hover:text-gold transition-colors">LinkedIn</span>
            <span className="cursor-pointer hover:text-gold transition-colors">Facebook</span>
        </div>
      </div>
    </footer>
  );
};
