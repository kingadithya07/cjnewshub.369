
import React, { useRef, useState, useMemo, useEffect } from 'react';
import Cropper from 'cropperjs';
import { useNews } from '../context/NewsContext';
import { Download, Scissors, X, ChevronLeft, ChevronRight, ArrowLeft, Calendar, ZoomIn, ZoomOut, Maximize, Share2, Check, Lock, LayoutGrid, Eye, ArrowUpDown, ArrowLeftRight, Upload, Image as ImageIcon, Copy, Link as LinkIcon, Facebook, Twitter, Settings, Type } from 'lucide-react';
import { Clipping } from '../types';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AdSpace } from '../components/AdSpace';
import { AdSize } from '../types';

export const EPaper: React.FC = () => {
  const { ePaperPages, addClipping, clippings, watermarkSettings, currentUser, showAds } = useNews();
  
  // Determine available dates (for reference, though we default to today)
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(ePaperPages.map(p => p.date)));
    return dates.sort((a: string, b: string) => b.localeCompare(a)); // Descending
  }, [ePaperPages]);

  // Determine initial date: Always default to Today's date in local time
  const initialDate = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // View Mode State: 'grid' (all pages) or 'single' (focused page)
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  // Fit Mode: 'width' (Readable, scrollable) or 'height' (Full page fit)
  const [fitMode, setFitMode] = useState<'width' | 'height'>('width');

  // Viewer State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  
  // Modal / Preview State
  const [previewClip, setPreviewClip] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Custom Header & Footer State
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [headerText, setHeaderText] = useState<string>('');
  
  // New: Custom Watermark State (Local override)
  const [localWatermarkLogo, setLocalWatermarkLogo] = useState<string | null>(null);
  const [showClipOptions, setShowClipOptions] = useState(false);

  const navigate = useNavigate();
  
  // Cropper refs
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperInstance = useRef<Cropper | null>(null);

  const myClippings = useMemo(() => {
      if (!currentUser) return clippings.filter(c => !c.userId); 
      return clippings.filter(c => c.userId === currentUser.id || !c.userId); 
  }, [clippings, currentUser]);

  // Format ISO YYYY-MM-DD to DD-MM-YYYY
  const formatDateDisplay = (ymd: string) => {
    if (!ymd) return '';
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

  // Initialize Cropper when cropping starts
  useEffect(() => {
    if (isCropping && imageRef.current && currentPage) {
        // Destroy existing instance if any (safeguard)
        if (cropperInstance.current) {
            cropperInstance.current.destroy();
        }

        cropperInstance.current = new Cropper(imageRef.current, {
            viewMode: 1,
            dragMode: 'move',
            background: false,
            autoCropArea: 0.5,
            guides: true,
            rotatable: false,
            scalable: true,
            zoomable: true, // Enabled zooming
            wheelZoomRatio: 0.1,
            checkCrossOrigin: true, // IMPORTANT for mobile caching and CORS
        });
    } else {
        // Clean up when leaving cropping mode
        if (cropperInstance.current) {
            cropperInstance.current.destroy();
            cropperInstance.current = null;
        }
    }

    return () => {
        if (cropperInstance.current) {
            cropperInstance.current.destroy();
            cropperInstance.current = null;
        }
    };
  }, [isCropping, currentPage]); // Re-init if page changes while cropping

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
      setCurrentPageIndex(0);
      setViewMode('grid'); // Reset to grid on date change
      setIsCropping(false);
      setZoomLevel(1);
      setHeaderImage(null);
      setHeaderText('');
      setLocalWatermarkLogo(null);
  };

  const handlePageClick = (index: number) => {
      setCurrentPageIndex(index);
      setViewMode('single');
      setZoomLevel(1);
      setFitMode('width'); // Default to width for better readability
      setIsCropping(false);
  };

  const handleBackToGrid = () => {
      setViewMode('grid');
      setIsCropping(false);
      setZoomLevel(1);
      setHeaderImage(null);
      setHeaderText('');
      setLocalWatermarkLogo(null);
  };

  const handleNext = () => {
    if (currentPageIndex < currentIssuePages.length - 1) {
        setCurrentPageIndex(prev => prev + 1);
        setIsCropping(false);
        setHeaderImage(null);
        setHeaderText('');
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
        setCurrentPageIndex(prev => prev - 1);
        setIsCropping(false);
        setHeaderImage(null);
        setHeaderText('');
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  // Cropper specific zoom
  const handleCropperZoomIn = () => cropperInstance.current?.zoom(0.1);
  const handleCropperZoomOut = () => cropperInstance.current?.zoom(-0.1);

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
              if (readerEvent.target?.result) {
                  setHeaderImage(readerEvent.target.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleWatermarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
              if (readerEvent.target?.result) {
                  setLocalWatermarkLogo(readerEvent.target.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCrop = async () => {
    const cropper = cropperInstance.current;
    if (cropper) {
        // Optimized settings for speed
        const canvas = cropper.getCroppedCanvas({
            fillColor: '#FFFFFF', // Ensure no transparency
        });

        if (!canvas) {
            alert("Could not create clip. Please ensure the image is fully loaded and a crop area is selected.");
            return;
        }

        try {
            // --- DYNAMIC SCALING LOGIC ---
            // We scale UI elements based on the clip width to ensure readability
            // Reference width is 1000px.
            const scale = Math.max(0.8, canvas.width / 1000);
            
            // Increased Height from 100 to 150 to accommodate larger text
            const bottomStripHeight = Math.round(150 * scale);
            const topStripHeight = (headerImage || headerText) ? Math.round(120 * scale) : 0; 
            const padding = Math.round(30 * scale);
            
            const totalWidth = canvas.width;
            const totalHeight = canvas.height + bottomStripHeight + topStripHeight;

            // Create Final Canvas
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = totalWidth;
            finalCanvas.height = totalHeight;

            const ctx = finalCanvas.getContext('2d');
            if (ctx) {
                // 1. Fill Entire Background with White
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

                // 2. Draw Top Header Strip (if enabled)
                if (topStripHeight > 0) {
                    if (headerImage) {
                         const headerImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                             const img = new Image();
                             img.crossOrigin = "Anonymous";
                             img.onload = () => resolve(img);
                             img.onerror = () => reject(new Error("Header load failed"));
                             img.src = headerImage;
                         }).catch(() => null);

                         if (headerImg) {
                             // Draw image centered in the top strip, maintaining aspect ratio
                             const hRatio = totalWidth / headerImg.naturalWidth;
                             const vRatio = topStripHeight / headerImg.naturalHeight;
                             // Use a slightly smaller ratio to leave some padding
                             const ratio = Math.min(hRatio, vRatio) * 0.9; 
                             
                             const drawWidth = headerImg.naturalWidth * ratio;
                             const drawHeight = headerImg.naturalHeight * ratio;
                             
                             // Center vertically and horizontally in the top strip
                             const centerX = (totalWidth - drawWidth) / 2;
                             const centerY = (topStripHeight - drawHeight) / 2;

                             ctx.drawImage(headerImg, centerX, centerY, drawWidth, drawHeight);
                         }
                    } else if (headerText) {
                         // Draw Text
                         ctx.fillStyle = '#1A1A1A'; 
                         const headerFontSize = Math.round(48 * scale);
                         ctx.font = `bold ${headerFontSize}px "Playfair Display", serif`;
                         ctx.textAlign = 'center';
                         ctx.textBaseline = 'middle';
                         ctx.fillText(headerText, totalWidth / 2, topStripHeight / 2);
                    }
                }

                // 3. Draw The Cropped Article
                ctx.drawImage(canvas, 0, topStripHeight);

                // 4. Draw Bottom Footer Strip
                const footerY = topStripHeight + canvas.height;
                
                // Separator Line
                ctx.beginPath();
                ctx.moveTo(0, footerY);
                ctx.lineTo(totalWidth, footerY);
                ctx.strokeStyle = '#E5E5E5';
                ctx.lineWidth = 2 * scale;
                ctx.stroke();

                let textStartX = padding;

                // 4a. Draw Logo (Local Override or Global)
                const logoToUse = localWatermarkLogo || watermarkSettings.logoUrl;
                
                if (logoToUse) {
                    try {
                        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                            const img = new Image();
                            img.crossOrigin = "Anonymous";
                            img.onload = () => resolve(img);
                            img.onerror = () => reject(new Error("Logo load failed"));
                            img.src = logoToUse!;
                        });
                        
                        const logoH = bottomStripHeight * 0.6; // 60% of strip height
                        const logoScale = logoH / logoImg.naturalHeight;
                        const logoW = logoImg.naturalWidth * logoScale;
                        const logoY = footerY + (bottomStripHeight - logoH) / 2;
                        
                        ctx.drawImage(logoImg, textStartX, logoY, logoW, logoH);
                        textStartX += logoW + padding;
                    } catch (e) {
                        console.warn("Watermark logo failed to load:", e);
                    }
                }

                // 4b. Draw Text (Site Name) - Ink Color #1A1A1A
                const siteName = watermarkSettings.text || "CJ NEWS HUB";
                ctx.fillStyle = '#1A1A1A'; 
                // Font Size Increased from 36 to 60
                const nameFontSize = Math.round(60 * scale);
                ctx.font = `bold ${nameFontSize}px "Playfair Display", serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left'; // Reset alignment
                ctx.fillText(siteName, textStartX, footerY + (bottomStripHeight / 2));

                // 4c. Draw Date - Grey text, Right aligned
                const formattedDate = formatDateDisplay(selectedDate);
                ctx.fillStyle = '#4B5563'; // Tailwind Gray-600
                // Font Size Increased from 20 to 34
                const dateFontSize = Math.round(34 * scale);
                ctx.font = `bold ${dateFontSize}px "Lato", sans-serif`;
                ctx.textAlign = 'right';
                ctx.fillText(formattedDate, finalCanvas.width - padding, footerY + (bottomStripHeight / 2));
            }

            // Export (Slightly reduced quality 0.95 -> 0.90 for speed)
            const watermarkedImage = finalCanvas.toDataURL('image/jpeg', 0.90); 
            setPreviewClip(watermarkedImage);
            setIsSaved(false); // Reset save state
            setShowShareModal(true);
            setIsCropping(false);
            setShowClipOptions(false); // Hide settings if open

        } catch (error) {
            console.error("Error creating clip:", error);
            alert("Failed to save clip. Browser security restrictions may prevent cropping remote images.");
        }
    }
  };

  const saveClippingToSidebar = () => {
      if (!currentUser) {
          // If not logged in, show confirm and redirect
          if(confirm("Sign in to save clippings to your personal notebook?")) {
              navigate('/login');
          }
          return;
      }

      if (previewClip && !isSaved) {
          const newClipping: Clipping = {
              id: Date.now().toString(),
              dataUrl: previewClip,
              timestamp: Date.now()
          };
          addClipping(newClipping);
          setIsSaved(true);
      }
  };

  const downloadClipping = () => {
      if (!previewClip) return;
      const link = document.createElement('a');
      link.href = previewClip;
      link.download = `cj-news-clip-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const copyLinkToClipboard = async () => {
       // Since we are using DataURLs for this demo (no cloud storage upload), 
       // we can't truly share a "link" to the image. 
       // We will simulate copying the page URL + text.
       const text = `Read this article on CJ News Hub: ${window.location.href}`;
       try {
           await navigator.clipboard.writeText(text);
           alert("Link copied to clipboard!");
       } catch (err) {
           console.error("Failed to copy", err);
       }
  };

  const handleSocialShare = (platform: string) => {
    if (!previewClip) return;
    const currentUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this news from CJ News Hub edition ${formatDateDisplay(selectedDate)}.`);
    
    let url = '';
    switch (platform) {
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${text}&url=${currentUrl}`;
            break;
        case 'whatsapp':
            url = `https://wa.me/?text=${text}%20${currentUrl}`;
            break;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
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

            {viewMode === 'single' && (
                <button 
                    onClick={handleBackToGrid} 
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gold hover:text-ink text-white px-3 py-1.5 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest mr-4"
                >
                    <LayoutGrid size={16} /> Grid View
                </button>
            )}

            <h2 className="hidden lg:block font-serif text-lg md:text-xl font-bold text-gold">E-PAPER ARCHIVE</h2>
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
             
            {/* View Controls (Only in SINGLE VIEW and NOT cropping) */}
            {viewMode === 'single' && !isCropping && currentIssuePages.length > 0 && (
                <div className="flex items-center bg-gray-700 rounded mr-2 divide-x divide-gray-600">
                    <button 
                        onClick={() => setFitMode(fitMode === 'width' ? 'height' : 'width')} 
                        className="p-2 hover:text-gold flex items-center gap-1" 
                        title={fitMode === 'width' ? "Fit to Page Height" : "Fit to Width (Readable)"}
                    >
                        {fitMode === 'width' ? <ArrowUpDown size={16}/> : <ArrowLeftRight size={16}/>}
                        <span className="text-xs font-bold hidden sm:inline">{fitMode === 'width' ? 'Fit Page' : 'Fit Width'}</span>
                    </button>

                    <button onClick={handleZoomOut} className="p-2 hover:text-gold" title="Zoom Out"><ZoomOut size={16}/></button>
                    <span className="text-xs w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-2 hover:text-gold" title="Zoom In"><ZoomIn size={16}/></button>
                    <button onClick={handleResetZoom} className="p-2 hover:text-gold" title="Reset"><Maximize size={16}/></button>
                </div>
            )}

            {/* Crop Toggle (Only in SINGLE VIEW) */}
            {viewMode === 'single' && !isCropping && currentIssuePages.length > 0 && (
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
                    
                    {/* Header/Footer Settings Toggle */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowClipOptions(!showClipOptions)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-bold transition-colors ${headerImage || headerText || localWatermarkLogo ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
                            title="Add Header or Footer Image"
                        >
                            <Settings size={16} />
                            <span className="hidden sm:inline">Design</span>
                        </button>
                        
                        {showClipOptions && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white text-ink p-4 rounded shadow-xl z-50 border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                                <h4 className="font-bold text-xs uppercase mb-3 border-b pb-1 text-ink flex justify-between items-center">
                                    Clip Design Settings
                                    <button onClick={() => setShowClipOptions(false)}><X size={14}/></button>
                                </h4>
                                
                                {/* Header Section */}
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Header (Top)</p>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><ImageIcon size={12}/> Upload Header Image</label>
                                    <input type="file" accept="image/*" onChange={handleHeaderImageUpload} className="text-xs w-full text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                    
                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 mx-2 text-gray-400 text-[10px] font-bold">OR</span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>

                                    <div className="mb-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Header Text</label>
                                        <input 
                                            type="text" 
                                            value={headerText} 
                                            onChange={(e) => setHeaderText(e.target.value)}
                                            placeholder="e.g. BREAKING NEWS"
                                            className="w-full border p-2 text-xs rounded focus:ring-1 focus:ring-gold outline-none"
                                        />
                                    </div>
                                    {(headerImage || headerText) && <button onClick={() => {setHeaderImage(null); setHeaderText('');}} className="text-[10px] text-red-600 underline mt-1 block w-full text-right">Clear Header</button>}
                                </div>

                                <div className="border-t border-gray-200 my-3"></div>

                                {/* Footer/Watermark Section */}
                                <div className="mb-2">
                                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Watermark (Bottom)</p>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><ImageIcon size={12}/> Upload Watermark Logo</label>
                                    <input type="file" accept="image/*" onChange={handleWatermarkLogoUpload} className="text-xs w-full text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                    <p className="text-[9px] text-gray-400 italic mt-1">Overrides default logo.</p>
                                    {localWatermarkLogo && <button onClick={() => setLocalWatermarkLogo(null)} className="text-[10px] text-red-600 underline mt-1 block w-full text-right">Use Default</button>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Crop Zoom Controls */}
                    <div className="flex items-center bg-gray-700 rounded mr-2 divide-x divide-gray-600">
                         <button onClick={handleCropperZoomOut} className="p-2 hover:text-gold" title="Zoom Out"><ZoomOut size={16}/></button>
                         <button onClick={handleCropperZoomIn} className="p-2 hover:text-gold" title="Zoom In"><ZoomIn size={16}/></button>
                    </div>

                    <button 
                        onClick={() => {
                            setIsCropping(false);
                            setHeaderImage(null);
                            setHeaderText('');
                            setLocalWatermarkLogo(null);
                            setShowClipOptions(false);
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
        <div className="flex-1 bg-[#555] relative overflow-hidden p-0 min-h-[50vh]">
            
            {currentIssuePages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center text-gray-300">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-bold font-serif mb-2">No Issue Found</h3>
                    <p className="text-sm">There is no E-Paper edition available for {formatDateDisplay(selectedDate)}.</p>
                    <p className="text-xs text-gray-400 mt-2">Please select a different date from the toolbar.</p>
                 </div>
            ) : (
                <>
                    {/* --- GRID VIEW MODE --- */}
                    {viewMode === 'grid' && (
                        <div className="h-full overflow-y-auto p-8 bg-[#444]">
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
                                 {currentIssuePages.map((page, index) => (
                                     <div 
                                        key={page.id} 
                                        onClick={() => handlePageClick(index)}
                                        className="group cursor-pointer flex flex-col items-center"
                                     >
                                         <div className="relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-transparent hover:border-gold bg-white w-full aspect-[3/4.2]">
                                             <img 
                                                src={page.imageUrl} 
                                                alt={`Page ${page.pageNumber}`} 
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                crossOrigin="anonymous" // Ensure cross-origin caching works
                                             />
                                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                 <div className="opacity-0 group-hover:opacity-100 bg-ink/80 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2">
                                                     <Eye size={12} /> Read
                                                 </div>
                                             </div>
                                         </div>
                                         <span className="mt-3 text-white text-sm font-bold font-serif bg-black/30 px-3 py-0.5 rounded-full">
                                             Page {page.pageNumber}
                                         </span>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    {/* --- SINGLE VIEW MODE --- */}
                    {viewMode === 'single' && (
                        <div className="relative w-full h-full bg-[#444]">
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
                                <div className="w-full h-full bg-black p-4 z-20 flex items-center justify-center">
                                    {/* Direct Image for CropperJS initialization */}
                                    <div className="w-full h-full">
                                        <img 
                                            ref={imageRef}
                                            src={currentPage.imageUrl}
                                            alt="Crop Source"
                                            className="block max-w-full" 
                                            crossOrigin="anonymous" // Essential for CropperJS to export canvas
                                            // Let CropperJS manage dimensions via viewMode
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className={`w-full h-full overflow-auto flex ${fitMode === 'height' ? 'items-center' : 'items-start pt-4'} justify-center`}>
                                    <div 
                                        style={{ 
                                            transform: `scale(${zoomLevel})`, 
                                            transformOrigin: 'top center',
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                        className="shadow-2xl bg-white transition-all duration-300"
                                    >
                                        <img 
                                            src={currentPage.imageUrl} 
                                            alt={`Page ${currentPage.pageNumber}`} 
                                            className={fitMode === 'height' 
                                                ? "max-w-full max-h-[90vh] object-contain border-2 border-gray-700 bg-white" 
                                                : "w-full md:w-auto h-auto max-w-4xl object-contain border-2 border-gray-700 bg-white"
                                            }
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                </div>
                            )}
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
                            Use the scissor tool in single view to save clips.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myClippings.map((clip) => (
                                <div key={clip.id} className="bg-[#333] p-2 rounded border border-gray-700 group relative">
                                    <img src={clip.dataUrl} className="w-full h-auto mb-2 opacity-90 group-hover:opacity-100 bg-white" />
                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>{new Date(clip.timestamp).toLocaleTimeString()}</span>
                                        <button 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = clip.dataUrl;
                                                link.download = `cj-news-clip-${clip.id}.jpg`;
                                                link.click();
                                            }}
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
            {showAds && (
                <div className="p-4 bg-black border-t border-gray-800 hidden lg:flex justify-center">
                     <AdSpace size={AdSize.RECTANGLE} className="my-0" />
                </div>
            )}
        </div>

        {/* --- REDESIGNED COMPACT CLIPPING PREVIEW MODAL --- */}
        {showShareModal && previewClip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                    
                    {/* Left: Image Preview */}
                    <div className="flex-1 bg-gray-100 p-6 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        <img 
                            src={previewClip} 
                            alt="Clipped Content" 
                            className="max-w-full max-h-[60vh] md:max-h-full object-contain shadow-lg border-4 border-white transform hover:scale-[1.01] transition-transform duration-300" 
                        />
                        <button 
                            onClick={() => {
                                setShowShareModal(false);
                                setPreviewClip(null);
                            }}
                            className="absolute top-4 left-4 bg-white/80 p-2 rounded-full hover:bg-white text-gray-700 md:hidden z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full md:w-64 bg-white border-l border-gray-200 flex flex-col z-10">
                        {/* Header - Compact */}
                        <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-serif font-bold text-base text-ink">Clip Ready</h3>
                            <button 
                                onClick={() => {
                                    setShowShareModal(false);
                                    setPreviewClip(null);
                                }}
                                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content - Compact */}
                        <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                            
                            <div className="grid grid-cols-2 gap-2">
                                {/* Save Action */}
                                {isSaved ? (
                                    <button disabled className="col-span-1 bg-green-100 text-green-700 py-2 rounded font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-default border border-green-200 h-16">
                                        <Check size={16} /> <span>Saved</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={saveClippingToSidebar}
                                        className={`col-span-1 py-2 rounded font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all h-16 ${currentUser ? 'bg-ink text-white hover:bg-gold hover:text-ink shadow-sm' : 'bg-white border border-ink text-ink hover:bg-gray-50'}`}
                                        title={currentUser ? "Save to Notebook" : "Sign in to Save"}
                                    >
                                        {currentUser ? (
                                            <><Check size={16} /> <span>Save</span></>
                                        ) : (
                                            <><Lock size={16} /> <span>Save</span></>
                                        )}
                                    </button>
                                )}

                                {/* Download Action */}
                                <button 
                                    onClick={downloadClipping}
                                    className="col-span-1 bg-blue-600 text-white py-2 rounded font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-blue-700 shadow-sm transition-colors h-16"
                                >
                                    <Download size={16} /> <span>Download</span>
                                </button>
                            </div>

                            {/* Share Grid - Compact */}
                            <div className="bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                                <p className="text-[9px] font-bold uppercase text-gray-400 mb-2 text-center tracking-widest">Share</p>
                                <div className="flex justify-between px-2">
                                    <button onClick={() => handleSocialShare('whatsapp')} className="text-[#25D366] hover:scale-110 transition-transform" title="WhatsApp">
                                        <Share2 size={20} />
                                    </button>
                                    <button onClick={() => handleSocialShare('facebook')} className="text-[#1877F2] hover:scale-110 transition-transform" title="Facebook">
                                        <Facebook size={20} />
                                    </button>
                                    <button onClick={() => handleSocialShare('twitter')} className="text-black hover:scale-110 transition-transform" title="X (Twitter)">
                                        <Twitter size={20} />
                                    </button>
                                    <button onClick={copyLinkToClipboard} className="text-gray-600 hover:scale-110 transition-transform" title="Copy Link">
                                        <LinkIcon size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            {!currentUser && (
                                <RouterLink to="/subscribe" className="text-[9px] text-center text-blue-600 underline mt-1">
                                    Login to sync clips
                                </RouterLink>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
