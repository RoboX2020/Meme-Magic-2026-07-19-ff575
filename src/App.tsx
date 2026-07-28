/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon, Loader2, RefreshCw, Eye, Trash2, History as HistoryIcon, Share2, Sparkles, MoveRight, Copy, Frame, X as XIcon, MessageCircle, Linkedin, Instagram, Link2, ArrowUpDown, Type, Megaphone } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const TEMPLATES = [
  { id: '1', name: 'Confused', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80' },
  { id: '2', name: 'Happy Dog', url: 'https://images.unsplash.com/photo-1537151608804-ea6f11840eb3?w=800&q=80' },
  { id: '3', name: 'Epic Landscape', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80' },
  { id: '4', name: 'Office Meeting', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' },
  { id: '5', name: 'Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80' },
];

interface HistoryItem {
  id: string;
  dataUrl: string;
  timestamp: number;
}

type FrameType = 'none' | 'scrapbook' | 'neon' | 'filmstrip' | 'clean';

const FRAME_OPTIONS: { id: FrameType; name: string; description: string }[] = [
  { id: 'none', name: 'No Frame', description: 'No border' },
  { id: 'scrapbook', name: 'Scrapbook', description: 'Colorful background' },
  { id: 'neon', name: 'Neon Glow', description: 'Glowing border' },
  { id: 'filmstrip', name: 'Film Strip', description: 'Classic film' },
  { id: 'clean', name: 'Clean', description: 'White border' },
];

const FONT_OPTIONS = [
  { id: 'impact', name: 'Impact', family: 'Impact, Arial Black, sans-serif' },
  { id: 'arial', name: 'Arial Bold', family: 'Arial, Helvetica, sans-serif' },
  { id: 'comic', name: 'Comic Sans', family: '"Comic Sans MS", cursive, sans-serif' },
  { id: 'courier', name: 'Courier', family: '"Courier New", monospace' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif' },
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive" },
];

const LOADING_PHRASES = [
  "Analyzing sass levels...",
  "Consulting the meme lords...",
  "Extracting raw comedic value...",
  "Running sarcasm subroutines...",
  "Checking for cringe...",
  "Warming up AI brain cells...",
  "Sprinkling extra flavor...",
  "Generating peak comedy...",
];

function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 flex flex-col items-center justify-center gap-4 w-full bg-white brutal-border rounded-none border border-black/50 brutal-shadow overflow-hidden">
      
      <div className="grid grid-cols-4 gap-1 w-24 h-24 p-2 bg-primary rounded-none brutal-shadow relative overflow-hidden border-4 border-black">
        {Array.from({ length: 16 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          // Stagger from bottom-up (row 3 is bottom, drops first -> lowest delay)
          const stagger = (3 - row) * 0.4 + (col * 0.15);
          const colors = [
            'bg-cyan-400', 'bg-blue-500', 'bg-orange-500', 
            'bg-yellow-400', 'bg-green-400', 'bg-purple-400', 'bg-red-400'
          ];
          const colorIndex = Math.floor((row * 2 + col) % colors.length);
          const color = colors[colorIndex];

          return (
            <motion.div
              key={i}
              className={`w-full h-full ${color} rounded-[2px] brutal-shadow`}
              initial={{ y: -80, opacity: 0 }}
              animate={{ 
                y: [ -80, 0, 0, 0 ], 
                opacity: [ 0, 1, 1, 0 ],
                scale: [1, 1, 1, 0.5]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: stagger,
                times: [0, 0.15, 0.8, 1],
                ease: "backOut"
              }}
            />
          )
        })}
      </div>

      <div className="relative h-6 w-full flex justify-center mt-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-semibold text-primary absolute text-center w-full px-4"
          >
            {LOADING_PHRASES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function TextSizeBar({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  const min = 10;
  const max = 150;
  const bars = 24;
  const activeIndex = Math.max(0, Math.min(bars - 1, Math.round(((value - min) / (max - min)) * (bars - 1))));

  const updateValue = (clientX: number, currentTarget: EventTarget & HTMLDivElement) => {
    const rect = currentTarget.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    onChange(Math.round(min + pct * (max - min)));
  };

  return (
    <div 
      className="flex items-end gap-[2px] h-10 w-full cursor-pointer touch-none group"
      onPointerDown={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.setPointerCapture(e.pointerId);
        updateValue(e.clientX, target);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          updateValue(e.clientX, e.currentTarget);
        }
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const heightPct = 15 + (i / (bars - 1)) * 85;
        const isActive = i <= activeIndex;
        return (
          <div
            key={i}
            className={`flex-1 rounded-[1px] transition-colors duration-75 ${
              isActive ? 'bg-primary' : 'bg-white group-hover:bg-neutral-300'
            }`}
            style={{ height: `${heightPct}%` }}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  
  // New State
  const [captionStyle, setCaptionStyle] = useState('sarcastic');
  const [captionLength, setCaptionLength] = useState('short');
  const [layout, setLayout] = useState('overlay');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [frame, setFrame] = useState<FrameType>('none');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fontFamily, setFontFamily] = useState('Impact, Arial Black, sans-serif');
  const [supportivePrompt, setSupportivePrompt] = useState('');
  
  // Structured Advertisement Details
  const [brandName, setBrandName] = useState('');
  const [offer, setOffer] = useState('');
  const [speciality, setSpeciality] = useState('');

  const memeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-adjust text color when switching layout
  useEffect(() => {
    if (layout !== 'overlay' && textColor === '#ffffff') {
      setTextColor('#000000');
    } else if (layout === 'overlay' && textColor === '#000000') {
      setTextColor('#ffffff');
    }
  }, [layout]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('meme_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Auto-save debounced
  useEffect(() => {
    if (!image) return;
    if (!topText && !bottomText && captions.length === 0) return;
    
    const timeout = setTimeout(async () => {
      if (!memeRef.current) return;
      try {
        const dataUrl = await toPng(memeRef.current, { cacheBust: true, pixelRatio: 1 });
        const newItem = { id: Date.now().toString(), dataUrl, timestamp: Date.now() };
        
        setHistory(prev => {
          let nextHistory = [...prev];
          // Update the last history item if it was created less than 2 minutes ago to avoid spam
          if (nextHistory.length > 0 && Date.now() - nextHistory[0].timestamp < 120000) {
             nextHistory[0] = newItem;
          } else {
             nextHistory = [newItem, ...nextHistory].slice(0, 15);
          }
          
          while (nextHistory.length > 0) {
            try {
              localStorage.setItem('meme_history', JSON.stringify(nextHistory));
              break;
            } catch (e) {
              nextHistory.pop();
            }
          }
          return nextHistory;
        });
      } catch (err) {
        console.error('Error auto-saving:', err);
      }
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [image, topText, bottomText, layout, textAlign, fontSize, textColor, strokeColor, captions]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setMimeType(file.type);
      setCaptions([]);
    };
    reader.readAsDataURL(file);
  };

  const loadTemplate = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMimeType(blob.type);
        setCaptions([]);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to load template:', error);
      alert('Failed to load template. Please try another one or upload an image.');
    }
  };

  const generateMagicCaptions = async () => {
    if (!image) return;
    setIsGenerating(true);
    setCaptions([]);

    try {
      let base64Data = image;
      
      // Compress the image before sending to Gemini
      try {
        const img = new Image();
        img.src = image;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          base64Data = canvas.toDataURL('image/jpeg', 0.8);
        }
      } catch (err) {
        console.error('Failed to compress image:', err);
      }

      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          mimeType: base64Data.startsWith('data:image/jpeg') ? 'image/jpeg' : mimeType,
          captionStyle,
          captionLength,
          supportivePrompt: supportivePrompt.trim(),
          advertisementDetails: captionStyle === 'advertisement' ? {
            brandName: brandName.trim(),
            offer: offer.trim(),
            speciality: speciality.trim()
          } : undefined
        }),
      });

      if (!res.ok) {
        let errMessage = 'Failed to fetch from server';
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch(e) {}
        throw new Error(errMessage);
      }

      const data = await res.json();
      
      if (data.captions) {
        setCaptions(data.captions);
      } else {
        throw new Error('No captions in response');
      }
    } catch (error: any) {
      console.error('Error generating captions:', error);
      alert(error.message || 'Failed to generate captions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!memeRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(memeRef.current, { cacheBust: true });
      setPreviewImage(dataUrl);
      setIsPreviewOpen(true);
      
      const newItem = { id: Date.now().toString(), dataUrl, timestamp: Date.now() };
      setHistory(prev => {
        let nextHistory = [...prev];
        if (nextHistory.length > 0 && Date.now() - nextHistory[0].timestamp < 120000) {
           nextHistory[0] = newItem;
        } else {
           nextHistory = [newItem, ...nextHistory].slice(0, 15);
        }
        while (nextHistory.length > 0) {
          try {
            localStorage.setItem('meme_history', JSON.stringify(nextHistory));
            break;
          } catch (e) {
            nextHistory.pop();
          }
        }
        return nextHistory;
      });
    } catch (err) {
      console.error('Error generating preview:', err);
      alert('Failed to generate preview.');
    } finally {
      setIsDownloading(false);
    }
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  };

  const saveToDevice = async () => {
    if (!previewImage) return;
    const blob = dataUrlToBlob(previewImage);
    const file = new File([blob], 'meme-magic.png', { type: 'image/png' });

    // Try Web Share API (saves to gallery on mobile)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Meme Magic' });
        setIsPreviewOpen(false);
        return;
      } catch (e) {
        // User cancelled or error — fall through to download
      }
    }

    // Fallback: browser download
    const link = document.createElement('a');
    link.download = 'meme-magic.png';
    link.href = previewImage;
    link.click();
    setIsPreviewOpen(false);
  };

  const shareToWhatsApp = () => {
    if (!previewImage) return;
    // WhatsApp doesn't support direct image sharing via URL, use Web Share API
    const blob = dataUrlToBlob(previewImage);
    const file = new File([blob], 'meme-magic.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'Made with Make ur Meme', text: 'Check out this meme! 🔥' });
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent('Check out this meme I made! 🔥 https://meme-magic-three.vercel.app'), '_blank');
    }
  };

  const shareToX = () => {
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('Made this meme with Make ur Meme! 🔥') + '&url=' + encodeURIComponent('https://meme-magic-three.vercel.app'), '_blank');
  };

  const shareToLinkedIn = () => {
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent('https://meme-magic-three.vercel.app'), '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct web sharing — use native share
    if (!previewImage) return;
    const blob = dataUrlToBlob(previewImage);
    const file = new File([blob], 'meme-magic.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: 'Made with Make ur Meme' });
    } else {
      alert('To share on Instagram: save the image first, then open Instagram and share from your gallery.');
    }
  };

  const shareNative = async () => {
    if (!previewImage) return;
    const blob = dataUrlToBlob(previewImage);
    const file = new File([blob], 'meme-magic.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Meme Magic', text: 'Check out this meme! 🔥' });
      } catch (e) { /* cancelled */ }
    } else {
      alert('Native sharing is not supported on this browser. Try saving the image first.');
    }
  };

  const copyImageToClipboard = async () => {
    if (!previewImage) return;
    try {
      const blob = dataUrlToBlob(previewImage);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      alert('Failed to copy image. Your browser may not support this feature.');
    }
  };

  const applyCaption = (caption: string) => {
    if (caption.length > 30 && caption.includes(' ')) {
      const middle = Math.floor(caption.length / 2);
      const spaceIndex = caption.lastIndexOf(' ', middle);
      if (spaceIndex !== -1) {
        setTopText(caption.substring(0, spaceIndex).trim());
        setBottomText(caption.substring(spaceIndex + 1).trim());
        return;
      }
    }
    setTopText('');
    setBottomText(caption);
  };

  const swapTexts = () => {
    const temp = topText;
    setTopText(bottomText);
    setBottomText(temp);
  };

  const getFrameClasses = (): string => {
    switch (frame) {
      case 'scrapbook': return 'border-[4px] border-white shadow-lg';
      case 'neon': return 'border-[3px] border-white/80';
      case 'filmstrip': return 'border-x-[18px] border-y-[6px] border-black';
      case 'clean': return 'border-[10px] border-white shadow-md';
      default: return '';
    }
  };

  const getFrameWrapperStyle = (): React.CSSProperties => {
    if (frame === 'scrapbook') {
      return { background: '#FFD93D', padding: '16px', borderRadius: '0px', border: '3px dashed rgba(0,0,0,0.15)' };
    }
    if (frame === 'neon') {
      return { background: '#111', padding: '8px', borderRadius: '0px', boxShadow: '0 0 15px #ff6b6b, 0 0 30px #ff6b6b, inset 0 0 15px rgba(255,107,107,0.1)' };
    }
    if (frame === 'filmstrip') {
      return { background: '#000', padding: '4px 0', borderRadius: '0px' };
    }
    if (frame === 'clean') {
      return { background: '#fff', padding: '0', borderRadius: '0px' };
    }
    return {};
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color: textColor,
    WebkitTextStroke: layout === 'overlay' ? `2px ${strokeColor}` : '0px',
    paintOrder: 'stroke fill' as any,
    textShadow: layout === 'overlay' ? `3px 3px 0 ${strokeColor}, -3px -3px 0 ${strokeColor}, 3px -3px 0 ${strokeColor}, -3px 3px 0 ${strokeColor}, 0 3px 0 ${strokeColor}, 0 -3px 0 ${strokeColor}, 3px 0 0 ${strokeColor}, -3px 0 0 ${strokeColor}` : 'none',
    fontFamily: fontFamily,
    textAlign: textAlign,
    lineHeight: 1.2,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-black sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-end gap-1">
            <h1 className="text-3xl font-bold tracking-tight leading-none" style={{ fontFamily: "'Caveat', cursive" }}>Make ur Meme</h1>
          </div>
          <div className="flex items-center gap-3">
             <Button onClick={handlePreview} disabled={!image || isDownloading} variant="default" size="sm" className="brutal-shadow">
               {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
               Preview / Download
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            <Card className="overflow-hidden bg-white border-dashed border-2 flex items-center justify-center min-h-[500px] relative">
              {!image ? (
                <div className="text-center p-8 flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-none brutal-shadow">
                    <ImageIcon className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">No image selected</h3>
                    <p className="text-black font-medium text-sm mt-1">Upload an image or select a template to start</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-4 bg-primary/5 overflow-auto">
                  <div ref={memeRef} className="relative inline-flex flex-col max-w-full" style={getFrameWrapperStyle()}>
                    <div
                      className={`relative inline-flex flex-col max-w-full ${frame === 'none' ? 'brutal-shadow brutal-border' : getFrameClasses()}`}
                      style={{ backgroundColor: layout === 'overlay' ? '#000' : '#fff' }}
                    >
                      {layout === 'top-pane' && (
                        <div className="px-6 py-8 flex flex-col gap-4 w-full bg-white">
                          {topText && <div style={textStyle} className="uppercase font-black">{topText}</div>}
                          {bottomText && <div style={textStyle} className="uppercase font-black">{bottomText}</div>}
                        </div>
                      )}

                      <div className="relative flex items-center justify-center">
                        <img 
                          src={image} 
                          alt="User uploaded photo for meme generation" 
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                        
                        {layout === 'overlay' && (
                          <>
                            <div
                              className="absolute top-4 left-0 right-0 px-4 uppercase font-black pointer-events-none"
                              style={textStyle}
                            >
                              {topText}
                            </div>
                            <div
                              className="absolute bottom-4 left-0 right-0 px-4 uppercase font-black pointer-events-none"
                              style={textStyle}
                            >
                              {bottomText}
                            </div>
                          </>
                        )}
                      </div>

                      {layout === 'bottom-pane' && (
                        <div className="px-6 py-8 flex flex-col gap-4 w-full bg-white">
                          {topText && <div style={textStyle} className="uppercase font-black">{topText}</div>}
                          {bottomText && <div style={textStyle} className="uppercase font-black">{bottomText}</div>}
                        </div>
                      )}
                    </div>
                    {/* Permanent Watermark — always visible */}
                    <div
                      className="absolute bottom-2 right-2 z-20 pointer-events-none select-none"
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.6)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                        letterSpacing: '1px',
                        lineHeight: 1,
                      }}
                    >
                      makeurmeme.online
                    </div>
                    {/* Watermark for framed memes */}
                    {frame !== 'none' && (
                      <div className={`text-center py-1 text-[10px] font-semibold tracking-wider uppercase opacity-50 ${frame === 'polaroid' ? 'text-gray-400 bg-white pb-2' : 'text-black/40'}`} style={{ fontFamily: "'Caveat', cursive", fontSize: '13px', letterSpacing: '2px' }}>
                        Make ur Meme
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Image Source</Label>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Upload an image">
                        <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                        Upload
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold text-primary flex items-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          Magic Captions
                        </Label>
                        <p className="text-xs text-black font-medium">AI analyzes your image for funny captions</p>
                      </div>
                      <Button 
                        onClick={generateMagicCaptions} 
                        disabled={!image || isGenerating}
                        size="sm"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Generate
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-black font-medium">AI Vibe</Label>
                        <Select value={captionStyle} onValueChange={setCaptionStyle}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select a vibe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Classic & Funny</SelectItem>
                            <SelectItem value="sarcastic">Savage & Sarcastic</SelectItem>
                            <SelectItem value="hinglish">Hinglish Savage</SelectItem>
                            <SelectItem value="quotes">Motivational ✨</SelectItem>
                            <SelectItem value="advertisement"><Megaphone className="w-3 h-3 inline mr-1" />Advertisement 📢</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-black font-medium">Length</Label>
                        <Select value={captionLength} onValueChange={setCaptionLength}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short & Punchy</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Supportive Prompt / Advertisement Details */}
                    {captionStyle === 'advertisement' ? (
                      <div className="space-y-3 mt-3 p-3 bg-gray-50 border border-gray-200 rounded-none">
                        <Label className="text-xs text-black font-semibold flex items-center gap-1 mb-2">
                          <Megaphone className="w-3 h-3" /> Advertisement Details
                        </Label>
                        
                        <div className="space-y-1">
                          <Label className="text-[10px] text-black font-medium">Brand / Product Name</Label>
                          <Input
                            placeholder="e.g. Nike, Apple, or 'My Cool App'"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="bg-white h-7 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-black font-medium">Offer / Discount (Optional)</Label>
                          <Input
                            placeholder="e.g. 50% Off, Buy 1 Get 1 Free"
                            value={offer}
                            onChange={(e) => setOffer(e.target.value)}
                            className="bg-white h-7 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-black font-medium">Speciality / Vibe (Optional)</Label>
                          <Input
                            placeholder="e.g. Super lightweight, best for coding"
                            value={speciality}
                            onChange={(e) => setSpeciality(e.target.value)}
                            className="bg-white h-7 text-xs"
                          />
                        </div>
                        <p className="text-[9px] text-black/50 leading-tight">
                          These details will be woven directly into the meme caption to create a viral ad.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs text-black font-medium flex items-center gap-1">
                          💡 Hint / Direction (Optional)
                        </Label>
                        <Input
                          placeholder="e.g. Make it about Mondays, office life..."
                          value={supportivePrompt}
                          onChange={(e) => setSupportivePrompt(e.target.value)}
                          className="bg-white text-sm"
                        />
                        <p className="text-[10px] text-black/50">
                          Give the AI a nudge — topic, mood, or inside joke to guide the caption direction.
                        </p>
                      </div>
                    )}

                    {isGenerating ? (
                      <div className="mt-4">
                        <LoadingState />
                      </div>
                    ) : captions.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        <AnimatePresence>
                          {captions.map((caption, idx) => (
                            <motion.button
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: idx * 0.1 }}
                              key={idx}
                              onClick={() => applyCaption(caption)}
                              className="w-full text-left p-3 text-sm bg-white border border-black rounded-none hover:border-primary hover:bg-primary/5 transition-all brutal-shadow group"
                            >
                              <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                                "{caption}"
                              </span>
                            </motion.button>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Frame Options */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Frame className="w-4 h-4" />
                      Frame Style
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {FRAME_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFrame(f.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-none border-2 transition-all text-xs font-medium ${
                            frame === f.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-black/20 bg-white hover:border-black/40'
                          }`}
                        >
                          {f.id === 'none' && <div className="w-6 h-6 border border-dashed border-black/30" />}
                          {f.id === 'scrapbook' && <div className="w-6 h-6 bg-yellow-300 border border-dashed border-black/20 flex items-center justify-center"><div className="w-4 h-4 bg-white border border-white" /></div>}
                          {f.id === 'neon' && <div className="w-6 h-6 bg-gray-900 border border-white/80 flex items-center justify-center" style={{ boxShadow: '0 0 4px #ff6b6b' }}><div className="w-4 h-4 bg-gray-700" /></div>}
                          {f.id === 'filmstrip' && <div className="w-6 h-6 bg-black border-x-[3px] border-y-[1px] border-black flex items-center justify-center"><div className="w-4 h-4 bg-gray-300" /></div>}
                          {f.id === 'clean' && <div className="w-6 h-6 bg-white border-[2px] border-white shadow-md flex items-center justify-center"><div className="w-4 h-4 bg-gray-200" /></div>}
                          <span className="truncate w-full text-center" style={{ fontSize: '9px' }}>{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Layout</Label>
                        <Select value={layout} onValueChange={setLayout}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overlay">Overlay</SelectItem>
                            <SelectItem value="top-pane">Top Pane</SelectItem>
                            <SelectItem value="bottom-pane">Bottom Pane</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Alignment</Label>
                        <Select value={textAlign} onValueChange={(v: any) => setTextAlign(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="topText">Top Text</Label>
                      <Input
                        id="topText"
                        placeholder="TOP TEXT"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button variant="ghost" size="sm" onClick={swapTexts} className="gap-1 text-xs text-black/50 hover:text-primary" aria-label="Swap top and bottom text">
                        <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                        Swap
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bottomText">Bottom Text</Label>
                      <Input
                        id="bottomText"
                        placeholder="BOTTOM TEXT"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Type className="w-4 h-4" /> Font</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((f) => (
                            <SelectItem key={f.id} value={f.family}>
                              <span style={{ fontFamily: f.family }}>{f.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Text Size</Label>
                        <span className="text-xs text-black font-medium">{fontSize}px</span>
                      </div>
                      <TextSizeBar
                        value={fontSize}
                        onChange={(v) => setFontSize(v)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Outline Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                            disabled={layout !== 'overlay'}
                          />
                          <Input
                            type="text"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="flex-1 font-mono text-sm"
                            disabled={layout !== 'overlay'}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="grid grid-cols-2 gap-4">
                        {TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => loadTemplate(template.url)}
                            className="group relative aspect-[4/3] rounded-none overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          >
                            <img
                              src={template.url}
                              alt={`Meme template: ${template.name}`}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-transparent to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                              <p className="text-black text-xs font-medium truncate">{template.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4" />
                        Recent Memes
                      </Label>
                      {history.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setHistory([]);
                          localStorage.removeItem('meme_history');
                        }}>
                          Clear All
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[600px] pr-4">
                      {history.length === 0 ? (
                        <div className="text-center py-12 text-black font-medium">
                          <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No saved memes yet.</p>
                          <p className="text-sm">Preview a meme to save it here!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {history.map((item) => (
                            <Card key={item.id} className="overflow-hidden group border-2 border-transparent hover:border-primary transition-all">
                              <CardContent className="p-0 relative aspect-square">
                                <img src={item.dataUrl} alt={`Saved Meme from ${new Date(item.timestamp).toLocaleDateString()}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                  <Button size="icon" variant="secondary" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setPreviewImage(item.dataUrl);
                                    setIsPreviewOpen(true);
                                  }} aria-label="Preview saved meme">
                                    <Eye className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const next = history.filter(h => h.id !== item.id);
                                    setHistory(next);
                                    localStorage.setItem('meme_history', JSON.stringify(next));
                                  }} aria-label="Delete saved meme">
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </div>
                              </CardContent>
                              <div className="p-2 text-xs text-center text-black font-medium bg-white brutal-border brutal-shadow truncate">
                                {new Date(item.timestamp).toLocaleString()}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Landing Page Content */}
      <section className="bg-white py-16 border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-black font-medium">Create the perfect meme in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-none bg-white brutal-border brutal-shadow border border-black">
              <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-none flex items-center justify-center mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Image</h3>
              <p className="text-black font-medium">Upload your own photo or choose from our collection of trending meme templates.</p>
            </div>
            <div className="p-6 rounded-none bg-white brutal-border brutal-shadow border border-black">
              <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-none flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Magic Caption</h3>
              <p className="text-black font-medium">Let our AI analyze the image and generate hilarious, context-aware captions instantly.</p>
            </div>
            <div className="p-6 rounded-none bg-white brutal-border brutal-shadow border border-black">
              <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-none flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Download & Share</h3>
              <p className="text-black font-medium">Customize the text layout and download your masterpiece to share with the world.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white brutal-border brutal-shadow py-16 border-t border-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-none brutal-shadow border border-black">
              <h3 className="text-lg font-semibold text-foreground">Is Make ur Meme free to use?</h3>
              <p className="mt-2 text-black font-medium">Yes! You can generate and download memes for free. Our AI uses advanced models to provide the best captions at no cost to you.</p>
            </div>
            <div className="bg-white p-6 rounded-none brutal-shadow border border-black">
              <h3 className="text-lg font-semibold text-foreground">What kind of AI do you use?</h3>
              <p className="mt-2 text-black font-medium">We utilize Google's Gemini 3.1 Pro model to analyze the image content and generate contextually relevant, funny captions in multiple languages and styles.</p>
            </div>
            <div className="bg-white p-6 rounded-none brutal-shadow border border-black">
              <h3 className="text-lg font-semibold text-foreground">Are my images saved?</h3>
              <p className="mt-2 text-black font-medium">We prioritize your privacy. Images are processed directly for caption generation and are temporarily stored in your browser's local storage for your history, not on our servers.</p>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Preview & Share</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center bg-background p-4 rounded-none min-h-[200px] overflow-auto">
            {previewImage ? (
              <img src={previewImage} alt="Generated Meme Preview" className="max-w-full max-h-[55vh] object-contain brutal-shadow" />
            ) : (
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            )}
          </div>

          {/* Share Options */}
          <div className="border-t border-black/10 pt-4 mt-2">
            <p className="text-sm font-semibold mb-3 text-black/70">Share to</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={shareToWhatsApp} className="gap-2 border-green-500 text-green-600 hover:bg-green-50">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={shareToInstagram} className="gap-2 border-pink-500 text-pink-600 hover:bg-pink-50">
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              <Button variant="outline" size="sm" onClick={shareToX} className="gap-2 border-black text-black hover:bg-gray-100">
                <XIcon className="w-4 h-4" />
                X (Twitter)
              </Button>
              <Button variant="outline" size="sm" onClick={shareToLinkedIn} className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={shareNative} className="gap-2">
                <Share2 className="w-4 h-4" />
                More...
              </Button>
              <Button variant="outline" size="sm" onClick={copyImageToClipboard} className={`gap-2 transition-all ${copySuccess ? 'border-green-500 text-green-600 bg-green-50' : ''}`}>
                {copySuccess ? <span>✓ Copied!</span> : <><Copy className="w-4 h-4" /> Copy Image</>}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={saveToDevice}>
              <Download className="w-4 h-4 mr-2" />
              Save to Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <footer className="mt-16 bg-primary py-12 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-black pb-8 mb-8">
            <div className="flex items-end gap-1 text-black justify-center md:justify-start">
              <span className="font-bold tracking-tight text-3xl leading-none" style={{ fontFamily: "'Caveat', cursive" }}>Make ur Meme</span>
            </div>
            <div className="text-center">
              <p className="text-sm">Generate hilarious, savage, and sarcastic memes instantly.</p>
            </div>
            <div className="flex gap-6 justify-center md:justify-end">
              <a href="#" className="hover:text-black transition-colors flex items-center gap-1"><Share2 className="w-4 h-4" /> Share</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} Make ur Meme. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
