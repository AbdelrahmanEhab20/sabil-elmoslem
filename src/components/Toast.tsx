"use client";

import React, { ReactElement } from 'react';
import { ToastType } from '@/types/toast';

const icons: Record<ToastType, ReactElement> = {
    success: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
        </svg>
    ),
    warning: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-2.99l-7.07-12.25a2 2 0 00-3.48 0L3.19 16.01A2 2 0 004.93 19z" />
        </svg>
    ),
};

const bgColors: Record<ToastType, string> = {
    success: 'bg-green-50 dark:bg-green-900/80',
    error: 'bg-red-50 dark:bg-red-900/80',
    info: 'bg-blue-50 dark:bg-blue-900/80',
    warning: 'bg-yellow-50 dark:bg-yellow-900/80',
};

const borderColors: Record<ToastType, string> = {
    success: 'border-green-400',
    error: 'border-red-400',
    info: 'border-blue-400',
    warning: 'border-yellow-400',
};

const textColors: Record<ToastType, string> = {
    success: 'text-green-800 dark:text-green-100',
    error: 'text-red-800 dark:text-red-100',
    info: 'text-blue-800 dark:text-blue-100',
    warning: 'text-yellow-800 dark:text-yellow-100',
};

interface ToastProps {
    type: ToastType;
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${bgColors[type]} ${borderColors[type]} ${textColors[type]} animate-fade-in-up min-w-[260px] max-w-xs`}
            role="alert"
            aria-live="assertive"
        >
            <div>{icons[type]}</div>
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button
                onClick={onClose}
                className="ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none"
                aria-label="Close"
                tabIndex={0}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast; 