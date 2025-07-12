'use client';

import React, { useState } from 'react';
import { TajweedRule } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { createPortal } from 'react-dom';

interface TajweedRulesBarProps {
    rules: TajweedRule[];
    className?: string;
}

export default function TajweedRulesBar({ rules, className = '' }: TajweedRulesBarProps) {
    const { preferences } = useUser();
    const [expanded, setExpanded] = useState(false);
    const [selectedRule, setSelectedRule] = useState<TajweedRule | null>(null);

    const isArabic = preferences.language === 'ar';

    return (
        <div className={`fixed top-0 left-0 w-full z-[1100] tajweed-rules-bar ${className} px-1 sm:px-2`} style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <h3 className="text-lg font-bold text-white dark:text-white">
                            {isArabic ? 'قواعد التجويد' : 'Tajweed Rules'}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={isArabic ? 'عرض/إخفاء التفاصيل' : 'Show/Hide Details'}
                        >
                            {expanded ? (
                                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                            ) : (
                                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* Rules Grid */}
            <div className={`max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 transition-all duration-300 ${expanded ? 'max-h-96 overflow-y-auto' : 'max-h-20 overflow-hidden'}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pb-4">
                    {rules.map((rule) => (
                        <button
                            key={rule.id}
                            onClick={() => setSelectedRule(selectedRule?.id === rule.id ? null : rule)}
                            className={`group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-900 ${selectedRule?.id === rule.id
                                ? 'border-gray-400 dark:border-gray-500 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            {/* Color indicator */}
                            <div
                                className="w-full h-2 rounded-full mb-2"
                                style={{ backgroundColor: rule.color }}
                            />
                            {/* Rule name */}
                            <div className="text-center">
                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    {isArabic ? rule.arabicName : rule.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {isArabic ? rule.name : rule.arabicName}
                                </div>
                            </div>
                            {/* Tooltip for brief description */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {isArabic ? rule.arabicDescription : rule.description}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            {/* Detailed Rule Modal (Portal, always on top) */}
            {selectedRule && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200] p-4" style={{ pointerEvents: 'auto' }}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <div
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: selectedRule.color }}
                                    />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {isArabic ? selectedRule.arabicName : selectedRule.name}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedRule(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-2xl absolute top-2 right-4"
                                    aria-label={isArabic ? 'إغلاق' : 'Close'}
                                    autoFocus
                                >
                                    ×
                                </button>
                            </div>
                            {/* Content */}
                            <div className="space-y-4">
                                {/* Description */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isArabic ? 'الوصف' : 'Description'}
                                    </h4>
                                    <p className="text-gray-900 dark:text-white leading-relaxed">
                                        {isArabic ? selectedRule.arabicDescription : selectedRule.description}
                                    </p>
                                </div>
                                {/* Example phrase/snippet */}
                                {selectedRule.examples.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {isArabic ? 'مثال تطبيقي' : 'Practical Example'}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200 rounded-full text-lg font-arabic"
                                            >
                                                {selectedRule.examples[0]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {/* Color Legend */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isArabic ? 'لون الترميز' : 'Color Code'}
                                    </h4>
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <div
                                            className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: selectedRule.color }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedRule.color}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
// TajweedRulesBar: fully responsive, always inherits dark/light mode from parent 