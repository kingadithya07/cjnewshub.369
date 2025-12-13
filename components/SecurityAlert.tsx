
import React, { useEffect, useState } from 'react';
import { useNews } from '../context/NewsContext';
import { ShieldAlert, MapPin, Monitor, CheckCircle, XCircle } from 'lucide-react';

export const SecurityAlert: React.FC = () => {
    const { currentUser, securityRequests, respondToSecurityRequest } = useNews();
    const [pendingRequest, setPendingRequest] = useState<typeof securityRequests[0] | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        // Check for pending requests targeting this user
        // We poll every 3 seconds to simulate real-time push
        const interval = setInterval(() => {
            const req = securityRequests.find(r => 
                r.userId === currentUser.id && 
                r.status === 'pending'
            );
            setPendingRequest(req || null);
        }, 3000);

        return () => clearInterval(interval);
    }, [currentUser, securityRequests]);

    const handleResponse = async (action: 'approve' | 'reject') => {
        if (pendingRequest) {
            await respondToSecurityRequest(pendingRequest.id, action);
            setPendingRequest(null);
        }
    };

    if (!pendingRequest) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-top justify-center md:justify-end p-4 md:p-8 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl border-l-4 border-red-600 w-full max-w-sm pointer-events-auto animate-in slide-in-from-right-10 duration-500">
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Security Alert</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                A new device is attempting to {pendingRequest.type === 'login' ? 'login' : 'reset password'} to your account.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3 mt-3 text-xs space-y-2 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Monitor size={14} className="text-gray-400" />
                            <span><strong>Device ID:</strong> {pendingRequest.deviceId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={14} className="text-gray-400" />
                            <span><strong>IP Address:</strong> {pendingRequest.ip}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={() => handleResponse('reject')}
                            className="flex-1 flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded text-xs font-bold uppercase transition-colors"
                        >
                            <XCircle size={14} /> Deny
                        </button>
                        <button 
                            onClick={() => handleResponse('approve')}
                            className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-bold uppercase transition-colors shadow-sm"
                        >
                            <CheckCircle size={14} /> Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
