import React, { useRef, useState, useMemo } from 'react';
import Cropper from 'react-cropper';
import { useNews } from '../context/NewsContext';
import { Download, Scissors, X, ChevronLeft, ChevronRight, ArrowLeft, Calendar, ZoomIn, ZoomOut, Maximize, Share2, Check, Lock } from 'lucide-react';
import { Clipping } from '../types';
import { useNavigate } from 'react-router-dom';
import { AdSpace } from '../components/AdSpace';
import { AdSize } from '../types';

export const EPaper: React.FC = () => {
  const { ePaperPages, addClipping, clippings, watermarkSettings, currentUser } = useNews();
  
  // Determine available dates
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(ePaperPages.map(p => p.date)));
    return dates.sort((a: string, b: string) => b.localeCompare(a)); // Descending
  }, [ePaperPages]);

  // Determine initial date (latest available)
  const initialDate = useMemo(() => {
    if (availableDates.length === 0) return new Date().toISOString().split('T')[0];
    return availableDates[0];
  }, [availableDates]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Viewer State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  
  // Modal / Preview State
  const [previewClip, setPreviewClip] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const navigate = useNavigate();
  const cropperRef = useRef<any>(null);

  // Filter clippings for current user if logged in, otherwise show local session clippings (default behavior of context)
  // But context behavior for 'clippings' is global localStorage. 
  // Improvement: Filter visual list by user ownership if strictly required, but for now we show all local.
  // Actually, let's filter:
  const myClippings = useMemo(() => {
      if (!currentUser) return clippings.filter(c => !c.userId); // Show anonymous clips? Or none? Let's show all for now or filter by 'me'.
      return clippings.filter(c => c.userId === currentUser.id || !c.userId); 
  }, [clippings, currentUser]);

  // Format ISO YYYY-MM-DD to DD-MM-YYYY
  const formatDateDisplay = (ymd: string) => {
    const parts = ymd.split('-');
    if (parts.length !== 3) return ymd;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  };

  // Filter pages based on selected date
  const currentIssuePages = useMemo(() => {
      return ePaperPages
        .filter(page => page.date === selectedDate)
        .sort((a, b) => a.pageNumber - b.pageNumber);
  }, [ePaperPages, selectedDate]);

  const currentPage = currentIssuePages[currentPageIndex];

  if (ePaperPages.length === 0) {
      return (
        <div className="p-12 text-center flex flex-col items-center justify-center h-screen bg-paper">
            <p className="mb-4">No E-Paper issues available in the system.</p>
            <button onClick={() => navigate('/')} className="text-ink underline">Return Home</button>
        </div>
      );
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
      setCurrentPageIndex(0); // Reset to cover page when changing dates
      setIsCropping(false);
      setZoomLevel(1);
  };

  const handleNext = () => {
    if (currentPageIndex < currentIssuePages.length - 1) setCurrentPageIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(prev => prev - 1);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
        const canvas = cropper.getCroppedCanvas();
        if (!canvas) {
            alert("Could not create clip. Please ensure the image is fully loaded and a crop area is selected.");
            return;
        }

        try {
            // Create a new canvas to add watermark (Site Name + Date)
            const watermarkHeight = 60;
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height + watermarkHeight;

            const ctx = finalCanvas.getContext('2d');
            if (ctx) {
                // Draw original cropped image
                ctx.drawImage(canvas, 0, 0);

                // Draw Watermark Background
                ctx.fillStyle = '#1A1A1A'; // Ink Color
                ctx.fillRect(0, canvas.height, finalCanvas.width, watermarkHeight);

                let textStartX = 20;

                // Draw Watermark Logo if present from Global Context
                if (watermarkSettings.logoUrl) {
                    const logoImg = new Image();
                    logoImg.src = watermarkSettings.logoUrl;
                    await new Promise((resolve) => {
                        logoImg.onload = resolve;
                        logoImg.onerror = resolve; // proceed even if fail
                    });

                    // Fit logo to height 40px
                    const logoH = 40;
                    const scale = logoH / logoImg.naturalHeight;
                    const logoW = logoImg.naturalWidth * scale;
                    
                    // Center logo vertically in watermark area
                    const logoY = canvas.height + (watermarkHeight - logoH) / 2;
                    
                    ctx.drawImage(logoImg, textStartX, logoY, logoW, logoH);
                    textStartX += logoW + 15; // Move text start position
                }

                // Draw Watermark Text from Global Context
                if (watermarkSettings.text) {
                    ctx.fillStyle = '#B89E72'; // Gold Color
                    ctx.font = 'bold 24px "Playfair Display", serif';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(watermarkSettings.text, textStartX, canvas.height + (watermarkHeight / 2));
                }

                // Draw Date
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '14px "Lato", sans-serif';
                ctx.textAlign = 'right';
                // Format date for watermark as DD-MM-YYYY
                const formattedDate = formatDateDisplay(selectedDate);
                ctx.fillText(formattedDate, finalCanvas.width - 20, canvas.height + (watermarkHeight / 2));
            }

            const watermarkedImage = finalCanvas.toDataURL('image/png');
            setPreviewClip(watermarkedImage);
            setShowShareModal(true);
            setIsCropping(false);

        } catch (error) {
            console.error("Error creating clip:", error);
            alert("Failed to save clip due to image security restrictions.");
        }
    }
  };

  const saveClippingToSidebar = () => {
      if (!currentUser) {
          // Redirect to subscribe if not logged in
          if(confirm("You must be a subscriber to save clippings to your account. Would you like to subscribe now?")) {
              navigate('/subscribe');
          }
          return;
      }

      if (previewClip) {
          const newClipping: Clipping = {
              id: Date.now().toString(),
              dataUrl: previewClip,
              timestamp: Date.now()
          };
          addClipping(newClipping);
          setShowShareModal(false);
          setPreviewClip(null);
          // Optional: reset zoom
          setZoomLevel(1);
      }
  };

  const downloadClipping = (dataUrl: string, filenamePrefix: string = 'cj-news-clip') => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filenamePrefix}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleShare = async (platform?: string) => {
    if (!previewClip) return;

    // Convert Base64 to Blob for native sharing
    const fetchRes = await fetch(previewClip);
    const blob = await fetchRes.blob();
    const file = new File([blob], "clipping.png", { type: "image/png" });

    const formattedDate = formatDateDisplay(selectedDate);

    const shareData = {
        title: 'CJ News Hub Clipping',
        text: `Read this article from CJ News Hub edition dated ${formattedDate}.`,
        url: window.location.href,
    };

    if (platform === 'native' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                ...shareData,
                files: [file]
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        // Fallback for social buttons (cannot upload image directly via URL params, so we share link)
        let url = '';
        const text = encodeURIComponent(`Check out this clipping from CJ News Hub (${formattedDate})`);
        const currentUrl = encodeURIComponent(window.location.href);

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${text}&url=${currentUrl}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${text}%20${currentUrl}`;
                break;
        }
        
        if (url) window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#333] flex flex-col font-sans">
      {/* Toolbar */}
      <div className="bg-ink text-white p-2 md:p-4 flex flex-col md:flex-row justify-between items-center shadow-md relative z-20 gap-4 md:gap-0 sticky top-0">
        
        {/* Left: Navigation & Branding */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
             <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 hover:text-gold transition-colors border-r border-gray-600 pr-4 mr-2"
                title="Back to Home"
            >
                <ArrowLeft size={20} />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Exit</span>
            </button>

            <h2 className="font-serif text-lg md:text-xl font-bold text-gold">E-PAPER ARCHIVE</h2>
        </div>

        {/* Center: Date Selector */}
        <div className="flex items-center gap-3 bg-gray-800 rounded px-3 py-1 border border-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-widest hidden sm:inline">Issue Date:</span>
            <input 
                type="date" 
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-transparent text-white text-sm font-bold focus:outline-none uppercase"
                max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
            />
        </div>

        {/* Right: Tools & Page Info */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
             
            {/* Zoom Controls (Only visible when NOT cropping) */}
            {!isCropping && currentIssuePages.length > 0 && (
                <div className="flex items-center bg-gray-700 rounded mr-2">
                    <button onClick={handleZoomOut} className="p-2 hover:text-gold" title="Zoom Out"><ZoomOut size={16}/></button>
                    <span className="text-xs w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-2 hover:text-gold" title="Zoom In"><ZoomIn size={16}/></button>
                    <button onClick={handleResetZoom} className="p-2 hover:text-gold border-l border-gray-600" title="Reset"><Maximize size={16}/></button>
                </div>
            )}

            {!isCropping && currentIssuePages.length > 0 && (
                <button 
                    onClick={() => {
                        setIsCropping(true);
                        setZoomLevel(1); // Reset zoom when entering crop mode for better UX
                    }}
                    className="flex items-center gap-2 bg-gold hover:bg-white hover:text-ink text-ink px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    <Scissors size={16} />
                    Clip Tool
                </button>
            )}
            
            {isCropping && (
                <div className="flex gap-2 items-center relative">
                    <button 
                        onClick={() => {
                            setIsCropping(false);
                        }}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-sm text-xs font-bold"
                    >
                        <X size={16} /> Cancel
                    </button>
                    <button 
                        onClick={handleCrop}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-sm text-xs font-bold"
                    >
                        <Scissors size={16} /> Clip & Share
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Main Viewer */}
        <div className="flex-1 bg-[#555] relative flex items-center justify-center overflow-hidden p-0 min-h-[50vh]">
            
            {currentIssuePages.length === 0 ? (
                 <div className="text-center text-gray-300">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-bold font-serif mb-2">No Issue Found</h3>
                    <p className="text-sm">There is no E-Paper edition available for {formatDateDisplay(selectedDate)}.</p>
                    <p className="text-xs text-gray-400 mt-2">Please select a different date from the toolbar.</p>
                 </div>
            ) : (
                <>
                    {/* Navigation Buttons (Overlay) */}
                    {!isCropping && (
                        <>
                            <button 
                                onClick={handlePrev} 
                                disabled={currentPageIndex === 0}
                                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-gold disabled:opacity-30 disabled:hover:bg-black/50 transition-all"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button 
                                onClick={handleNext} 
                                disabled={currentPageIndex === currentIssuePages.length - 1}
                                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-gold disabled:opacity-30 disabled:hover:bg-black/50 transition-all"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {isCropping ? (
                        <div className="w-full h-full bg-black p-4">
                            <Cropper
                                src={currentPage.imageUrl}
                                style={{ height: '100%', width: '100%' }}
                                initialAspectRatio={NaN} // Free crop
                                guides={true}
                                ref={cropperRef}
                                viewMode={1}
                                dragMode="move"
                                background={false}
                                autoCropArea={0.5}
                                checkCrossOrigin={true} 
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-auto flex items-center justify-center bg-[#444] p-8">
                            <div 
                                style={{ 
                                    transform: `scale(${zoomLevel})`, 
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s ease-out'
                                }}
                                className="shadow-2xl"
                            >
                                <img 
                                    src={currentPage.imageUrl} 
                                    alt={`Page ${currentPage.pageNumber}`} 
                                    className="max-w-full max-h-[85vh] object-contain border-2 border-gray-700 bg-white"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Sidebar: Tabs for Thumbnails, Clippings */}
        <div className="w-full lg:w-80 bg-[#1a1a1a] border-l border-gray-700 flex flex-col h-1/3 lg:h-auto z-10 shadow-xl">
            
            {/* Header instead of tabs */}
            <div className="py-3 bg-[#222] border-b border-gold text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                    My Clippings
                </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#222] p-4">
                
                {/* My Clippings Area */}
                <div>
                    <h3 className="text-gold text-xs font-bold uppercase mb-4 tracking-widest flex items-center justify-between">
                        Saved Clips 
                        <span className="bg-gray-800 text-white px-2 rounded-full text-[10px]">{myClippings.length}</span>
                    </h3>
                    
                    {!currentUser && (
                         <div className="bg-blue-900/30 border border-blue-700 p-3 mb-4 rounded text-center">
                             <p className="text-[10px] text-blue-200 mb-2">Login to sync your clippings across devices.</p>
                             <button onClick={() => navigate('/subscribe')} className="text-[10px] font-bold uppercase bg-blue-600 text-white px-3 py-1 rounded">Login</button>
                         </div>
                    )}

                    {myClippings.length === 0 ? (
                        <div className="text-gray-500 text-xs italic text-center mt-4">
                            Use the scissor tool to save clips from the paper.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myClippings.map((clip) => (
                                <div key={clip.id} className="bg-[#333] p-2 rounded border border-gray-700 group relative">
                                    <img src={clip.dataUrl} className="w-full h-auto mb-2 opacity-90 group-hover:opacity-100" />
                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>{new Date(clip.timestamp).toLocaleTimeString()}</span>
                                        <button 
                                            onClick={() => downloadClipping(clip.dataUrl, clip.id)}
                                            className="text-white hover:text-gold flex items-center gap-1"
                                        >
                                            <Download size={12} /> Save
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* E-Paper Sidebar Ad */}
            <div className="p-4 bg-black border-t border-gray-800 hidden lg:flex justify-center">
                 <AdSpace size={AdSize.RECTANGLE} className="my-0" />
            </div>
        </div>

        {/* --- CLIPPING PREVIEW & SHARE MODAL --- */}
        {showShareModal && previewClip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h3 className="font-serif font-bold text-xl text-ink">Clip Preview</h3>
                        <button 
                            onClick={() => {
                                setShowShareModal(false);
                                setPreviewClip(null);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-auto p-6 bg-gray-50 flex flex-col items-center">
                        <div className="border border-gray-300 shadow-lg bg-white mb-6 max-w-full">
                            <img src={previewClip} alt="Clipped Content" className="max-w-full h-auto" />
                        </div>

                        {/* Actions */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Primary Actions */}
                            <div className="space-y-3">
                                <button 
                                    onClick={saveClippingToSidebar}
                                    className="w-full flex items-center justify-center gap-2 bg-ink text-white py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-gold hover:text-ink transition-colors relative"
                                >
                                    {!currentUser && <Lock size={14} className="absolute left-4"/>}
                                    <Check size={16} /> Save to Sidebar
                                </button>
                                <button 
                                    onClick={() => downloadClipping(previewClip)}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-ink text-ink py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                                >
                                    <Download size={16} /> Download Image
                                </button>
                            </div>

                            {/* Share Actions */}
                            <div className="bg-gray-100 p-4 rounded border border-gray-200">
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                                    <Share2 size={12} /> Share Clipping
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Native Share (Mobile) */}
                                    <button onClick={() => handleShare('native')} className="col-span-2 bg-blue-600 text-white py-2 rounded text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1">
                                        <Share2 size={14} /> Share via App
                                    </button>

                                    {/* Social Links */}
                                    <button onClick={() => handleShare('whatsapp')} className="bg-[#25D366] text-white py-2 rounded text-xs font-bold hover:bg-[#128C7E]">WhatsApp</button>
                                    <button onClick={() => handleShare('facebook')} className="bg-[#1877F2] text-white py-2 rounded text-xs font-bold hover:bg-[#166FE5]">Facebook</button>
                                    <button onClick={() => handleShare('twitter')} className="bg-[#000000] text-white py-2 rounded text-xs font-bold hover:bg-[#333]">X (Twitter)</button>
                                    <button onClick={() => handleShare('linkedin')} className="bg-[#0A66C2] text-white py-2 rounded text-xs font-bold hover:bg-[#004182]">LinkedIn</button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-center leading-tight">
                                    *Social buttons share the article link. Use "Share via App" or "Download" to share the actual image.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};