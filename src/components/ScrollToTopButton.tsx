'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);
    const prefersReducedMotion = useReducedMotion();

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
            className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-[1200] rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 p-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </motion.button>
    );
}


