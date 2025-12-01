import { Theme } from '@/types';

export const themes: Theme[] = [
    // Modern & Clean
    { id: 'modern-slate', name: 'Modern Slate', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', textColor: '#1e293b', accentColor: '#3b82f6' },
    { id: 'minimal-dark', name: 'Minimal Dark', fontFamily: 'Inter, sans-serif', backgroundColor: '#18181b', textColor: '#f4f4f5', accentColor: '#a1a1aa' },
    { id: 'clean-white', name: 'Clean White', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', textColor: '#000000', accentColor: '#000000' },

    // Corporate
    { id: 'corp-blue', name: 'Corporate Blue', fontFamily: 'Roboto, sans-serif', backgroundColor: '#ffffff', textColor: '#1e3a8a', accentColor: '#1d4ed8' },
    { id: 'executive', name: 'Executive', fontFamily: 'Georgia, serif', backgroundColor: '#fdfbf7', textColor: '#27272a', accentColor: '#b45309' },
    { id: 'tech-startup', name: 'Tech Startup', fontFamily: 'Poppins, sans-serif', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#6366f1' },

    // Creative & Vibrant
    { id: 'vibrant-purple', name: 'Vibrant Purple', fontFamily: 'Outfit, sans-serif', backgroundColor: '#faf5ff', textColor: '#581c87', accentColor: '#9333ea', gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' },
    { id: 'sunset-glow', name: 'Sunset Glow', fontFamily: 'Outfit, sans-serif', backgroundColor: '#fff7ed', textColor: '#7c2d12', accentColor: '#ea580c', gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' },
    { id: 'ocean-breeze', name: 'Ocean Breeze', fontFamily: 'Quicksand, sans-serif', backgroundColor: '#ecfeff', textColor: '#164e63', accentColor: '#06b6d4', gradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)' },
    { id: 'neon-nights', name: 'Neon Nights', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#0f172a', textColor: '#e2e8f0', accentColor: '#22d3ee', gradient: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)' },

    // Nature
    { id: 'forest-mist', name: 'Forest Mist', fontFamily: 'Merriweather, serif', backgroundColor: '#f0fdf4', textColor: '#14532d', accentColor: '#16a34a' },
    { id: 'earthy-tones', name: 'Earthy Tones', fontFamily: 'Lora, serif', backgroundColor: '#fafaf9', textColor: '#44403c', accentColor: '#a8a29e' },

    // Elegant
    { id: 'luxury-gold', name: 'Luxury Gold', fontFamily: 'Playfair Display, serif', backgroundColor: '#1c1917', textColor: '#fafaf9', accentColor: '#d4af37', gradient: 'linear-gradient(to bottom, #1c1917, #292524)' },
    { id: 'rose-gold', name: 'Rose Gold', fontFamily: 'Playfair Display, serif', backgroundColor: '#fff1f2', textColor: '#881337', accentColor: '#e11d48' },

    // Bold
    { id: 'bold-red', name: 'Bold Red', fontFamily: 'Oswald, sans-serif', backgroundColor: '#ffffff', textColor: '#000000', accentColor: '#dc2626' },
    { id: 'high-contrast', name: 'High Contrast', fontFamily: 'Impact, sans-serif', backgroundColor: '#000000', textColor: '#fbbf24', accentColor: '#ffffff' },

    // Soft
    { id: 'pastel-pink', name: 'Pastel Pink', fontFamily: 'Nunito, sans-serif', backgroundColor: '#fdf2f8', textColor: '#831843', accentColor: '#f472b6' },
    { id: 'lavender-dream', name: 'Lavender Dream', fontFamily: 'Nunito, sans-serif', backgroundColor: '#f5f3ff', textColor: '#4c1d95', accentColor: '#a78bfa' },
    { id: 'mint-fresh', name: 'Mint Fresh', fontFamily: 'Nunito, sans-serif', backgroundColor: '#f0fdfa', textColor: '#134e4a', accentColor: '#2dd4bf' },

    // Dark Modes
    { id: 'midnight-blue', name: 'Midnight Blue', fontFamily: 'Inter, sans-serif', backgroundColor: '#020617', textColor: '#e2e8f0', accentColor: '#38bdf8' },
    { id: 'deep-space', name: 'Deep Space', fontFamily: 'Exo 2, sans-serif', backgroundColor: '#000000', textColor: '#e5e7eb', accentColor: '#6366f1', gradient: 'radial-gradient(circle at center, #1e1b4b 0%, #000000 100%)' },
    { id: 'cyberpunk', name: 'Cyberpunk', fontFamily: 'Rajdhani, sans-serif', backgroundColor: '#050505', textColor: '#00ff41', accentColor: '#ff00ff' },

    // Gradients
    { id: 'aurora', name: 'Aurora', fontFamily: 'Quicksand, sans-serif', backgroundColor: '#000000', textColor: '#ffffff', accentColor: '#4ade80', gradient: 'linear-gradient(to right, #4ade80, #3b82f6)' },
    { id: 'sunset-gradient', name: 'Sunset Gradient', fontFamily: 'Montserrat, sans-serif', backgroundColor: '#000000', textColor: '#ffffff', accentColor: '#f97316', gradient: 'linear-gradient(to right, #f97316, #db2777)' },
    { id: 'cool-blues', name: 'Cool Blues', fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#3b82f6', gradient: 'linear-gradient(to bottom, #eff6ff, #dbeafe)' },

    // Retro
    { id: 'retro-pop', name: 'Retro Pop', fontFamily: 'Righteous, cursive', backgroundColor: '#fef08a', textColor: '#000000', accentColor: '#ef4444' },
    { id: 'vintage-paper', name: 'Vintage Paper', fontFamily: 'Courier Prime, monospace', backgroundColor: '#f5f5dc', textColor: '#3f3f46', accentColor: '#854d0e' },

    // Professional
    { id: 'consulting', name: 'Consulting', fontFamily: 'Lato, sans-serif', backgroundColor: '#ffffff', textColor: '#374151', accentColor: '#059669' },
    { id: 'finance', name: 'Finance', fontFamily: 'Lato, sans-serif', backgroundColor: '#f8fafc', textColor: '#0f172a', accentColor: '#1e40af' },
    { id: 'academic', name: 'Academic', fontFamily: 'Merriweather, serif', backgroundColor: '#ffffff', textColor: '#000000', accentColor: '#7f1d1d' },
];

export const getTheme = (id?: string) => themes.find(t => t.id === id) || themes[0];
