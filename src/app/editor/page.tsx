'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, Download, Plus, Layout as LayoutIcon, ChevronLeft, Loader2, Wand2, LogOut, Bold, Italic, Type, Palette, MessageSquarePlus, Play, X, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Type as TypeIcon, Trash2, Undo, Redo } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { generateSlideContent, generateImage } from '@/lib/ai';
import { generatePPTX } from '@/lib/ppt-generator';
import SlidePreview from '@/components/SlidePreview';
import { Slide, SlideElement } from '@/types';
import { themes, getTheme } from '@/lib/themes';
import { layouts, getLayout } from '@/lib/layouts';
import useHistory from '@/hooks/useHistory';

function EditorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topic = searchParams.get('topic');
    const countParam = searchParams.get('count');
    const slideCount = countParam ? parseInt(countParam) : 5;

    // State with History
    const {
        state: slides,
        setState: setSlides,
        setTransient: setSlidesTransient,
        undo,
        redo,
        canUndo,
        canRedo
    } = useHistory<Slide[]>([]);

    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const hasGenerated = useRef(false);

    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // New State
    const [showRegenModal, setShowRegenModal] = useState(false);
    const [regenType, setRegenType] = useState<'content' | 'image' | 'both'>('both');
    const [regenInstruction, setRegenInstruction] = useState('');
    const [isSlideshow, setIsSlideshow] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);
    const [showLayoutPicker, setShowLayoutPicker] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // router.push('/auth'); // Allow guest access for now or redirect
                setUser({ id: 'guest' }); // Mock user
            } else {
                setUser(session.user);
            }
        };
        checkUser();
    }, [router]);

    useEffect(() => {
        if (topic && user && !hasGenerated.current && slides && slides.length === 0) {
            hasGenerated.current = true;
            startGeneration(topic, slideCount);
        }
    }, [topic, user, slides, slideCount]);

    const startGeneration = async (topic: string, count: number) => {
        setIsGenerating(true);
        setLoadingMessage('Generating outline with Gemini...');

        const apiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
        const raphaelToken = localStorage.getItem('RAPHAEL_AI_TOKEN') || undefined;

        try {
            const rawSlides = await generateSlideContent(topic, count, apiKey);

            // Convert raw output to Element-based structure
            const newSlides: Slide[] = rawSlides.map((s: any) => {
                const slideId = Math.random().toString(36).substr(2, 9);
                const elements: SlideElement[] = [];

                // Title Element
                elements.push({
                    id: `title-${slideId}`,
                    type: 'text',
                    content: s.title.replace(/\*\*/g, '').replace(/\*/g, ''), // Strip markdown
                    x: 50, y: 50, width: 800, height: 100,
                    style: { fontSize: '36px', fontWeight: 'bold', textAlign: 'center' }
                });

                // Content Element
                elements.push({
                    id: `content-${slideId}`,
                    type: 'text',
                    content: s.content.replace(/\*\*/g, '').replace(/\*/g, ''), // Strip markdown
                    x: 50, y: 180, width: 800, height: 300,
                    style: { fontSize: '18px', textAlign: 'left' }
                });

                // Image Element (Background)
                if (s.imagePrompt) {
                    elements.unshift({ // Add to beginning (bottom layer)
                        id: `image-${slideId}`,
                        type: 'image',
                        content: '', // Will be filled later
                        x: 0, y: 0, width: 1024, height: 576,
                        style: { objectFit: 'cover', opacity: 0.5 } // Semi-transparent to let text show
                    });
                }

                return {
                    id: slideId,
                    elements,
                    themeId: 'modern-slate', // Default theme
                    isGenerating: true,
                    layout: s.layout
                };
            });

            setSlides(newSlides);
            setLoadingMessage('Generating images with Raphael AI...');

            // Generate images in parallel
            newSlides.forEach((slide, index) => {
                const imageElement = slide.elements.find(e => e.type === 'image');
                const rawSlide = rawSlides[index]; // Get original prompt

                if (imageElement && rawSlide.imagePrompt) {
                    generateImage(rawSlide.imagePrompt, raphaelToken).then((url) => {
                        setSlides(prev => prev.map(s => {
                            if (s.id === slide.id) {
                                return {
                                    ...s,
                                    isGenerating: false,
                                    elements: s.elements.map(e => e.id === imageElement.id ? { ...e, content: url } : e)
                                };
                            }
                            return s;
                        }));
                    }).catch(() => {
                        setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isGenerating: false } : s));
                    });
                } else {
                    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isGenerating: false } : s));
                }
            });

        } catch (error) {
            console.error(error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
            setLoadingMessage('');
        }
    };

    const updateElement = (elementId: string, field: string, value: any) => {
        const updater = (prev: Slide[]) => prev.map((s, i) => {
            if (i === activeSlideIndex) {
                return {
                    ...s,
                    elements: s.elements.map(e => {
                        if (e.id === elementId) {
                            if (field === 'position') return { ...e, x: value.x, y: value.y };
                            if (field === 'size') return { ...e, width: value.width, height: value.height, x: value.x, y: value.y };
                            if (field === 'style') return { ...e, style: { ...e.style, ...value } };
                            return { ...e, [field]: value };
                        }
                        return e;
                    })
                };
            }
            return s;
        });

        if (field === 'content') {
            setSlidesTransient(updater);
        } else {
            setSlides(updater);
        }
    };

    const updateElementStyle = (property: string, value: any) => {
        if (!selectedElementId) return;
        setSlides(prev => prev.map((s, i) => {
            if (i === activeSlideIndex) {
                return {
                    ...s,
                    elements: s.elements.map(e => {
                        if (e.id === selectedElementId) {
                            return { ...e, style: { ...e.style, [property]: value } };
                        }
                        return e;
                    })
                };
            }
            return s;
        }));
    };

    const addElement = (type: 'text' | 'image') => {
        const newElement: SlideElement = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'text' ? 'New Text' : '',
            x: 100, y: 100, width: 300, height: type === 'text' ? 100 : 300,
            style: type === 'text' ? { fontSize: '18px', color: 'inherit' } : {}
        };

        setSlides(prev => prev.map((s, i) => i === activeSlideIndex ? { ...s, elements: [...s.elements, newElement] } : s));
    };

    const deleteElement = () => {
        if (!selectedElementId) return;
        setSlides(prev => prev.map((s, i) => {
            if (i === activeSlideIndex) {
                return {
                    ...s,
                    elements: s.elements.filter(e => e.id !== selectedElementId)
                };
            }
            return s;
        }));
        setSelectedElementId(null);
    };

    const deleteSlide = (index: number) => {
        if (slides.length <= 1) return;
        const newSlides = [...slides];
        newSlides.splice(index, 1);
        setSlides(newSlides);
        if (activeSlideIndex >= newSlides.length) {
            setActiveSlideIndex(newSlides.length - 1);
        }
    };

    const handleRegenerate = async () => {
        // ... (Simplified regen logic for brevity, ideally calls AI again)
        setShowRegenModal(false);
        alert(`Regenerating ${regenType} with instruction: ${regenInstruction}`);
    };

    const handleDownload = async () => {
        await generatePPTX(slides, `${topic || 'presentation'}.pptx`);
    };

    const applyTheme = (themeId: string) => {
        setSlides(prev => prev.map(s => ({ ...s, themeId })));
        setShowThemePicker(false);
    };

    const applyLayout = (layoutId: string) => {
        const layout = getLayout(layoutId);
        if (!layout || !slides[activeSlideIndex]) return;

        const currentSlide = slides[activeSlideIndex];

        // Classify existing elements
        const existingTexts = currentSlide.elements.filter(e => e.type === 'text');
        const existingImages = currentSlide.elements.filter(e => e.type === 'image');

        // Get new slots
        const newTextSlots = layout.elements.filter(e => e.type === 'text');
        const newImageSlots = layout.elements.filter(e => e.type === 'image');

        const newElements: SlideElement[] = [];

        // Map Texts
        newTextSlots.forEach((slot, i) => {
            const existing = existingTexts[i];
            newElements.push({
                ...slot,
                id: existing ? existing.id : Math.random().toString(36).substr(2, 9),
                content: existing ? existing.content : slot.content,
                // Keep slot style but maybe preserve some existing style properties? 
                // For now, adopt layout style to ensure it looks right.
            });
        });

        // Append extra texts
        for (let i = newTextSlots.length; i < existingTexts.length; i++) {
            newElements.push({
                ...existingTexts[i],
                y: 500 + (i - newTextSlots.length) * 50 // Stack below
            });
        }

        // Map Images
        newImageSlots.forEach((slot, i) => {
            const existing = existingImages[i];
            if (existing) {
                newElements.push({
                    ...slot,
                    id: existing.id,
                    content: existing.content
                });
            } else {
                // Need to generate!
                // Create a placeholder first, then trigger generation.
                const newId = Math.random().toString(36).substr(2, 9);
                newElements.push({
                    ...slot,
                    id: newId,
                    content: '' // Empty content triggers placeholder
                });

                // Trigger generation (async)
                const apiKey = localStorage.getItem('RAPHAEL_AI_TOKEN');
                if (apiKey) {
                    // Use slide title as context
                    const prompt = `Professional presentation image for: ${currentSlide.elements.find(e => e.id.includes('title'))?.content || 'business presentation'}`;
                    generateImage(prompt, apiKey).then(url => {
                        setSlides(prev => prev.map(s => s.id === currentSlide.id ? {
                            ...s,
                            elements: s.elements.map(e => e.id === newId ? { ...e, content: url } : e)
                        } : s));
                    });
                }
            }
        });

        // Append extra images
        for (let i = newImageSlots.length; i < existingImages.length; i++) {
            newElements.push({
                ...existingImages[i],
                x: 800, y: 500 // Move to corner
            });
        }

        setSlides(prev => prev.map((s, i) => i === activeSlideIndex ? { ...s, elements: newElements } : s));
        setShowLayoutPicker(false);
    };

    const handleSetBackground = (image: string) => {
        setSlides(prev => prev.map((s, i) => i === activeSlideIndex ? { ...s, backgroundImage: image } : s));
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSlideshow) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    setActiveSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
                } else if (e.key === 'ArrowLeft') {
                    setActiveSlideIndex(prev => Math.max(prev - 1, 0));
                } else if (e.key === 'Escape') {
                    setIsSlideshow(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSlideshow, slides.length]);

    if (!user || slides.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">{loadingMessage || 'Loading editor...'}</p>
                </div>
            </div>
        );
    }

    const activeSlide = slides[activeSlideIndex];
    const activeTheme = getTheme(activeSlide.themeId);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-700 text-sm">SlidesGO Editor</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`relative group cursor-pointer transition-all duration-200 ${index === activeSlideIndex ? 'ring-2 ring-purple-500 shadow-md scale-[1.02]' : 'hover:bg-gray-50 hover:shadow-sm'}`}
                            onClick={() => setActiveSlideIndex(index)}
                        >
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                <SlidePreview
                                    slide={slide}
                                    index={index}
                                    isActive={false}
                                    onUpdateElement={() => { }}
                                    scale={0.2} // Scale down for sidebar
                                />
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    {index + 1}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="Delete Slide"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            const newSlide: Slide = {
                                id: Math.random().toString(36).substr(2, 9),
                                elements: [
                                    { id: `title-${Math.random()}`, type: 'text', content: 'New Slide', x: 50, y: 50, width: 800, height: 100, style: { fontSize: '36px', fontWeight: 'bold', textAlign: 'center' } }
                                ],
                                themeId: activeSlide.themeId
                            };
                            setSlides([...slides, newSlide]);
                            setActiveSlideIndex(slides.length);
                        }}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Slide
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                {/* Toolbar */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`p-2 rounded-md transition-colors ${!canUndo ? 'text-gray-300' : 'hover:bg-white text-gray-700 shadow-sm'}`}
                                title="Undo"
                            >
                                <Undo className="w-4 h-4" />
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`p-2 rounded-md transition-colors ${!canRedo ? 'text-gray-300' : 'hover:bg-white text-gray-700 shadow-sm'}`}
                                title="Redo"
                            >
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="h-6 w-px bg-gray-200 mx-2" />
                        <button onClick={() => setShowThemePicker(true)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-sm font-medium">
                            <Palette className="w-4 h-4 text-purple-600" /> Themes
                        </button>
                        <button onClick={() => setShowLayoutPicker(true)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-sm font-medium">
                            <LayoutIcon className="w-4 h-4 text-blue-600" /> Layouts
                        </button>
                        <div className="h-6 w-px bg-gray-200 mx-2" />
                        <button onClick={() => addElement('text')} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-sm font-medium">
                            <TypeIcon className="w-4 h-4" /> Add Text
                        </button>
                        <button onClick={() => addElement('image')} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-sm font-medium">
                            <ImageIcon className="w-4 h-4" /> Add Image
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedElementId && (
                            <>
                                <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                                    <button onClick={() => updateElementStyle('fontWeight', 'bold')} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><Bold className="w-4 h-4" /></button>
                                    <button onClick={() => updateElementStyle('fontStyle', 'italic')} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><Italic className="w-4 h-4" /></button>
                                    <button onClick={() => updateElementStyle('textAlign', 'left')} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><AlignLeft className="w-4 h-4" /></button>
                                    <button onClick={() => updateElementStyle('textAlign', 'center')} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><AlignCenter className="w-4 h-4" /></button>
                                    <button onClick={() => updateElementStyle('textAlign', 'right')} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><AlignRight className="w-4 h-4" /></button>
                                    <input
                                        type="color"
                                        onChange={(e) => updateElementStyle('color', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer border-none ml-1"
                                    />
                                    <select
                                        onChange={(e) => updateElementStyle('fontSize', `${e.target.value}px`)}
                                        className="ml-1 text-xs bg-transparent border-none focus:ring-0"
                                        defaultValue="18"
                                    >
                                        {[12, 14, 16, 18, 24, 36, 48, 64, 72].map(s => <option key={s} value={s}>{s}px</option>)}
                                    </select>
                                </div>
                                <div className="h-4 w-px bg-gray-200" />
                                <button onClick={deleteElement} className="p-1.5 hover:bg-red-100 text-red-500 rounded" title="Delete Element">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setIsSlideshow(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                        >
                            <Play className="w-4 h-4" /> Slideshow
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                        >
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative">
                    <div className="relative shadow-2xl rounded-xl overflow-hidden bg-white ring-1 ring-black/5" style={{ width: '1024px', height: '576px' }}>
                        <SlidePreview
                            slide={activeSlide}
                            index={activeSlideIndex}
                            isActive={true}
                            onUpdateElement={updateElement}
                            onSelectElement={setSelectedElementId}
                            onSetBackground={handleSetBackground}
                            selectedElementId={selectedElementId}
                        />
                    </div>
                </div>

                {/* Floating Action Button for Regeneration - Moved outside scroll area */}
                <button
                    onClick={() => setShowRegenModal(true)}
                    className="absolute bottom-8 right-8 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-30"
                    title="Regenerate with AI"
                >
                    <Wand2 className="w-6 h-6" />
                </button>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showRegenModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <Wand2 className="w-5 h-5 text-purple-600" /> Regenerate Slide
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">What to regenerate?</label>
                                    <div className="flex gap-2">
                                        {['content', 'image', 'both'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setRegenType(t as any)}
                                                className={`flex-1 py-2 rounded-lg text-sm capitalize border ${regenType === t ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                                    <textarea
                                        value={regenInstruction}
                                        onChange={(e) => setRegenInstruction(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                                        rows={3}
                                        placeholder="e.g., Make it more professional..."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setShowRegenModal(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                                    <button onClick={handleRegenerate} className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">Regenerate</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isSlideshow && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
                    >
                        <div className="w-full h-full max-w-screen-xl max-h-screen p-4 flex items-center justify-center">
                            <div className="relative w-full aspect-video">
                                <SlidePreview
                                    slide={activeSlide}
                                    index={activeSlideIndex}
                                    isActive={false}
                                    onUpdateElement={() => { }}
                                    scale={1.5} // Scale up for slideshow
                                />
                            </div>
                        </div>
                        <button onClick={() => setIsSlideshow(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>

                        {/* Navigation Hints */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-sm">
                            Use Arrow Keys to Navigate • ESC to Exit
                        </div>
                    </motion.div>
                )}

                {showThemePicker && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 border-l border-gray-200 p-6 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Themes</h3>
                            <button onClick={() => setShowThemePicker(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => applyTheme(theme.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${activeSlide.themeId === theme.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'}`}
                                    style={{ background: theme.backgroundColor }}
                                >
                                    <div className="font-bold mb-1" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>{theme.name}</div>
                                    <div className="text-xs opacity-70" style={{ color: theme.textColor }}>Abc 123</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {showLayoutPicker && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 border-l border-gray-200 p-6 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Layouts</h3>
                            <button onClick={() => setShowLayoutPicker(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {layouts.map(layout => (
                                <button
                                    key={layout.id}
                                    onClick={() => applyLayout(layout.id)}
                                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 text-left transition-all bg-gray-50 hover:bg-white"
                                >
                                    <div className="font-medium text-gray-700">{layout.name}</div>
                                    {/* Mini visual representation could go here */}
                                    <div className="mt-2 h-16 bg-white border border-gray-200 rounded relative overflow-hidden">
                                        {layout.elements.map((el, i) => (
                                            <div
                                                key={i}
                                                className={`absolute bg-gray-200 border border-gray-300 ${el.type === 'image' ? 'bg-blue-50' : ''}`}
                                                style={{
                                                    left: `${(el.x / 1024) * 100}%`,
                                                    top: `${(el.y / 576) * 100}%`,
                                                    width: `${(el.width / 1024) * 100}%`,
                                                    height: `${(el.height / 576) * 100}%`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
            <EditorContent />
        </Suspense>
    );
}
