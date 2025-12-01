'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Presentation, Layers, Zap, Settings, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [slideCount, setSlideCount] = useState(8);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [raphaelToken, setRaphaelToken] = useState('');
    const [isSavingKeys, setIsSavingKeys] = useState(false);
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchKeys = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data, error } = await supabase
                    .from('user_api_keys')
                    .select('gemini_api_key, raphael_ai_token')
                    .eq('user_id', session.user.id)
                    .single();

                if (data) {
                    setApiKey(data.gemini_api_key || '');
                    setRaphaelToken(data.raphael_ai_token || '');
                }
            }
        };
        fetchKeys();
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [topic]);

    const saveKeys = async () => {
        setIsSavingKeys(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            alert('Please sign in to save keys securely.');
            setIsSavingKeys(false);
            return;
        }

        const { error } = await supabase
            .from('user_api_keys')
            .upsert({
                user_id: session.user.id,
                gemini_api_key: apiKey,
                raphael_ai_token: raphaelToken
            }, { onConflict: 'user_id' });

        setIsSavingKeys(false);

        if (error) {
            console.error('Error saving keys:', error);
            alert('Failed to save keys.');
        } else {
            setShowSettings(false);
        }
    };

    const handleStart = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!topic.trim()) return;

        setIsGenerating(true);
        // Simulate a brief loading state for effect
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push(`/editor?topic=${encodeURIComponent(topic)}&count=${slideCount}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleStart();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg">
                        <Presentation className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        SlidesGO
                    </span>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </header>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">API Settings</h2>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-yellow-200 text-sm mb-4">
                                    Keys are stored securely in your personal database record.
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Gemini API Key</label>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="Enter your Gemini API Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Raphael AI Token</label>
                                    <input
                                        type="password"
                                        value={raphaelToken}
                                        onChange={(e) => setRaphaelToken(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="Enter your Raphael AI Token"
                                    />
                                </div>
                                <button
                                    onClick={saveKeys}
                                    disabled={isSavingKeys}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all mt-4 flex items-center justify-center gap-2"
                                >
                                    {isSavingKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Keys Securely'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto w-full"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-200">AI-Powered Presentation Generator</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                        Create stunning slides <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                            in seconds, not hours.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Transform your ideas into professional presentations instantly.
                        Just describe your topic, and let our AI handle the design, content, and imagery.
                    </p>

                    <form onSubmit={handleStart} className="max-w-3xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex flex-col md:flex-row items-stretch bg-gray-900 rounded-2xl border border-white/10 p-2 shadow-2xl">
                            <div className="flex-1 flex items-start gap-4 px-4 py-2">
                                <Zap className="w-6 h-6 text-purple-500 mt-3 flex-shrink-0" />
                                <textarea
                                    ref={textareaRef}
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What do you want to present about? (e.g. 'The Future of AI in Healthcare')"
                                    className="w-full bg-transparent text-lg text-white placeholder:text-gray-500 focus:outline-none py-3 resize-none min-h-[60px] max-h-[200px] overflow-y-auto scrollbar-hide"
                                    rows={1}
                                />
                            </div>

                            <div className="flex items-center gap-4 pl-4 border-t md:border-t-0 md:border-l border-white/10 p-2 md:p-0 justify-end md:justify-start">
                                <div className="flex items-center gap-2 px-2">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={slideCount}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val <= 100) setSlideCount(val);
                                            else if (e.target.value === '') setSlideCount(0);
                                        }}
                                        className="w-8 bg-transparent text-white text-center focus:outline-none font-bold"
                                        title="Number of slides"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!topic.trim() || isGenerating}
                                    className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center h-full"
                                >
                                    {isGenerating ? (
                                        <span className="animate-pulse">Creating...</span>
                                    ) : (
                                        <>
                                            Generate <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
