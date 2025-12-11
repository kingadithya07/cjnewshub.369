
import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { Send, MapPin, Phone, Mail, CheckCircle, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Contact: React.FC = () => {
    const { sendContactMessage } = useNews();
    const location = useLocation();
    
    const categories = [
        'General Inquiry',
        'Editorial / News Tip',
        'Advertising / Sales',
        'Technical Support',
        'Subscription / Billing',
        'Careers / Jobs',
        'Report an Error'
    ];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'General Inquiry',
        subject: '',
        message: ''
    });
    const [success, setSuccess] = useState(false);

    // Pre-fill subject and category if navigating from footer links (e.g., "Advertise with Us")
    useEffect(() => {
        if (location.state?.subject) {
            const passedSubject = location.state.subject as string;
            let matchedCategory = 'General Inquiry';

            if (passedSubject.toLowerCase().includes('advert')) {
                matchedCategory = 'Advertising / Sales';
            } else if (passedSubject.toLowerCase().includes('support')) {
                matchedCategory = 'Technical Support'; // Or General
            }

            setFormData(prev => ({ 
                ...prev, 
                subject: passedSubject,
                category: matchedCategory
            }));
            
            // Optional: Scroll to form on mobile or small screens
            const formElement = document.getElementById('contact-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location.state]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Prefix subject with category for admin clarity
        const finalSubject = `[${formData.category}] ${formData.subject}`;
        
        sendContactMessage(formData.name, formData.email, finalSubject, formData.message);
        setSuccess(true);
        setFormData({ name: '', email: '', category: 'General Inquiry', subject: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="min-h-[80vh] bg-paper py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-4">Get in Touch</h1>
                    <p className="text-gray-500 font-sans max-w-2xl mx-auto">
                        Have a story tip, a question about our subscription, or just want to say hello? 
                        Our team is ready to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8 lg:pr-8 border-r-0 lg:border-r border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="bg-gold/10 p-3 rounded-full text-gold-dark">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink font-serif text-lg">Headquarters</h3>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    Chaanvikajyothi newspaper,<br/>
                                    Editor: Vaddadi Udayakumar,<br/>
                                    Sujathanagar, Visakhapatnam,<br/>
                                    Andhrapradesh-530051
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-gold/10 p-3 rounded-full text-gold-dark">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink font-serif text-lg">Phone</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    General: +91 8008129309
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-gold/10 p-3 rounded-full text-gold-dark">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink font-serif text-lg">Email</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    chanvikajyothi@gmail.com<br/>
                                    vaddadi92958@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div id="contact-form" className="lg:col-span-2 bg-white p-8 md:p-10 shadow-xl rounded-lg border-t-4 border-gold relative">
                        {success ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in">
                                <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-ink mb-2">Message Sent!</h3>
                                <p className="text-gray-500">Thank you for contacting us. We will get back to you shortly.</p>
                                <button 
                                    onClick={() => setSuccess(false)}
                                    className="mt-6 text-sm font-bold text-gold-dark underline uppercase tracking-widest"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Your Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Department / Category</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none bg-white cursor-pointer"
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                        value={formData.subject}
                                        onChange={e => setFormData({...formData, subject: e.target.value})}
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                                    <textarea 
                                        required
                                        rows={6}
                                        className="w-full border border-gray-300 p-3 rounded text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                                        value={formData.message}
                                        onChange={e => setFormData({...formData, message: e.target.value})}
                                        placeholder="Write your message here..."
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="bg-ink text-white font-bold uppercase text-xs tracking-widest px-8 py-4 hover:bg-gold hover:text-ink transition-colors flex items-center gap-2"
                                >
                                    <Send size={16} /> Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
