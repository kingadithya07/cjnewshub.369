
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-paper py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 p-8 md:p-12 rounded-lg">
                <div className="border-b-4 border-gold pb-6 mb-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink mb-4">Privacy Policy</h1>
                    <p className="text-gray-500 text-sm font-sans uppercase tracking-widest">Last Updated: November 24, 2025</p>
                </div>

                <div className="prose prose-slate max-w-none font-serif text-gray-700 leading-relaxed">
                    <p className="text-lg">
                        Welcome to <strong>CJ News Hub</strong> (operated by Chaanvikajyothi Newspaper). We value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website, read our E-Paper, or engage with our content.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-ink my-8">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-ink mb-2 mt-0">
                            <Shield className="text-gold-dark" size={24} /> 
                            Commitment to Security
                        </h3>
                        <p className="mb-0 text-sm">
                            We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mt-8">
                        <FileText size={20} className="text-gold" /> 
                        1. Information We Collect
                    </h2>
                    <p>We collect information in the following ways:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Personal Data:</strong> When you register as a Subscriber, Publisher, or Admin, we collect personally identifiable information such as your name, email address, and profile picture.</li>
                        <li><strong>Usage Data:</strong> We automatically collect information regarding your interaction with our website, including your IP address, browser type, pages visited (Analytics), and time spent on articles.</li>
                        <li><strong>User Content:</strong> Information you voluntarily provide when posting comments on articles or submitting queries via our Contact form.</li>
                        <li><strong>Cookies and Local Storage:</strong> We use local storage to persist your login session, clippings, and preferences (such as reading settings).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mt-8">
                        <Eye size={20} className="text-gold" /> 
                        2. How We Use Your Information
                    </h2>
                    <p>We use the collected information for specific purposes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>To provide and maintain our Service, including the E-Paper reader and clipping functionality.</li>
                        <li>To manage your account (registration, login, and profile updates).</li>
                        <li>To allow you to participate in interactive features like commenting and liking articles.</li>
                        <li>To improve our website functionality and user experience through analytics.</li>
                        <li>To contact you regarding your account, subscription, or inquiries submitted via our contact forms.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mt-8">
                        <Lock size={20} className="text-gold" /> 
                        3. Data Sharing and Disclosure
                    </h2>
                    <p>
                        We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                    </p>
                    <p>We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.</p>

                    <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mt-8">
                        4. E-Paper and Clippings
                    </h2>
                    <p>
                        Our E-Paper feature allows you to clip and save sections of the newspaper. If you are a registered user, these clippings are associated with your account ID. Please note that while clippings are private to your account, sharing them via social media makes that specific content public.
                    </p>

                    <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mt-8">
                        5. Third-Party Links
                    </h2>
                    <p>
                        Occasionally, at our discretion, we may include or offer third-party products or services (Advertisements) on our website. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites.
                    </p>

                    <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mt-8">
                        6. Your Rights
                    </h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Access the personal data we hold about you.</li>
                        <li>Request correction of inaccurate data.</li>
                        <li>Request deletion of your account and personal data (by contacting the administrator).</li>
                        <li>Opt-out of email communications.</li>
                    </ul>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mb-4">
                            <Mail size={20} className="text-gold" /> 
                            Contact Us
                        </h2>
                        <p className="mb-4">
                            If there are any questions regarding this privacy policy, you may contact us using the information below:
                        </p>
                        
                        <div className="bg-gray-100 p-6 rounded-md font-sans text-sm">
                            <p className="font-bold text-ink">Chaanvikajyothi Newspaper</p>
                            <p>Editor: Vaddadi Udayakumar</p>
                            <p>Sujathanagar, Visakhapatnam</p>
                            <p>Andhra Pradesh - 530051, India</p>
                            <div className="mt-4">
                                <p><strong>Email:</strong> chanvikajyothi@gmail.com, vaddadi92958@gmail.com</p>
                                <p><strong>Phone:</strong> +91 8008129309</p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/contact" className="text-gold-dark font-bold hover:underline uppercase tracking-widest text-sm">
                                Go to Contact Page
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
