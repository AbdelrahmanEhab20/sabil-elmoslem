'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Color schemes for different pages
const pageColors: Record<string, { bg: string; hover: string; ring: string }> = {
    '/': { 
        bg: 'bg-green-600', 
        hover: 'hover:bg-green-700', 
        ring: 'focus:ring-green-300 dark:focus:ring-green-800' 
    },
    '/prayer-times': { 
        bg: 'bg-blue-600', 
        hover: 'hover:bg-blue-700', 
        ring: 'focus:ring-blue-300 dark:focus:ring-blue-800' 
    },
    '/azkar': { 
        bg: 'bg-emerald-600', 
        hover: 'hover:bg-emerald-700', 
        ring: 'focus:ring-emerald-300 dark:focus:ring-emerald-800' 
    },
    '/quran': { 
        bg: 'bg-purple-600', 
        hover: 'hover:bg-purple-700', 
        ring: 'focus:ring-purple-300 dark:focus:ring-purple-800' 
    },
    '/qibla': { 
        bg: 'bg-amber-600', 
        hover: 'hover:bg-amber-700', 
        ring: 'focus:ring-amber-300 dark:focus:ring-amber-800' 
    },
};

const defaultColors = { 
    bg: 'bg-green-600', 
    hover: 'hover:bg-green-700', 
    ring: 'focus:ring-green-300 dark:focus:ring-green-800' 
};

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const pathname = usePathname();
    
    // Get colors based on current page
    const colors = pageColors[pathname] || defaultColors;

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY > 300);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    return (
        <motion.button
            type="button"
            aria-label="Scroll to top"
            onClick={handleClick}
            className={`fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-[1200] rounded-full text-white shadow-lg focus:outline-none focus:ring-4 p-3.5 transition-colors duration-300 ${colors.bg} ${colors.hover} ${colors.ring}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </motion.button>
    );
}
