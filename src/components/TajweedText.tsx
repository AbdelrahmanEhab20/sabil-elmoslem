'use client';

import React from 'react';
import { TajweedWord, TajweedRule } from '@/types';

interface TajweedTextProps {
    words: TajweedWord[];
    className?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
}

export default function TajweedText({
    words,
    className = '',
    fontSize = '2xl',
    lineHeight = 'relaxed'
}: TajweedTextProps) {
    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'sm': return 'text-sm';
            case 'base': return 'text-base';
            case 'lg': return 'text-lg';
            case 'xl': return 'text-xl';
            case '2xl': return 'text-2xl';
            case '3xl': return 'text-3xl';
            case '4xl': return 'text-4xl';
            default: return 'text-2xl';
        }
    };

    const getLineHeightClass = () => {
        switch (lineHeight) {
            case 'tight': return 'leading-tight';
            case 'normal': return 'leading-normal';
            case 'relaxed': return 'leading-relaxed';
            case 'loose': return 'leading-loose';
            default: return 'leading-relaxed';
        }
    };

    return (
        <div
            className={`font-arabic text-right ${getFontSizeClass()} ${getLineHeightClass()} ${className}`}
            dir="rtl"
        >
            {words.map((word, wordIdx) => (
                <span key={wordIdx}>
                    {word.letters.map((letter, letterIdx) => {
                        const rule = letter.tajweedRules[0];
                        const letterClasses = rule ? getTajweedClassesForLetter(letter.tajweedRules) : 'text-gray-900 dark:text-white';

                        return (
                            <span
                                key={letterIdx}
                                className={`transition-colors duration-200 ${letterClasses}`}
                                style={rule ? { color: rule.color, fontWeight: 600, textShadow: `0 0 1px ${rule.color}40` } : {}}
                                title={letter.tajweedRules.length > 0 ? letter.tajweedRules.map(r => r.name).join(', ') : undefined}
                            >
                                {letter.char}
                            </span>
                        );
                    })}
                    {/* Add space after each word except the last one */}
                    {wordIdx < words.length - 1 && ' '}
                </span>
            ))}
        </div>
    );
}

// Helper function to get CSS classes for a letter based on its Tajweed rules
function getTajweedClassesForLetter(rules: TajweedRule[]): string {
    if (rules.length === 0) {
        return 'text-gray-900 dark:text-white';
    }

    const ruleIds = rules.map(rule => rule.id);
    const classes = ['font-semibold'];

    // Apply specific classes for each rule type
    if (ruleIds.includes('ghunnah')) {
        classes.push('tajweed-ghunnah');
    }
    if (ruleIds.includes('idgham-with-ghunnah')) {
        classes.push('tajweed-idgham-with-ghunnah');
    }
    if (ruleIds.includes('idgham-without-ghunnah')) {
        classes.push('tajweed-idgham-without-ghunnah');
    }
    if (ruleIds.includes('idgham-shafawi')) {
        classes.push('tajweed-idgham-shafawi');
    }
    if (ruleIds.includes('idgham-mutajanisayn')) {
        classes.push('tajweed-idgham-mutajanisayn');
    }
    if (ruleIds.includes('idgham-mutaqaribayn')) {
        classes.push('tajweed-idgham-mutaqaribayn');
    }
    if (ruleIds.includes('ikhfa')) {
        classes.push('tajweed-ikhfa');
    }
    if (ruleIds.includes('ikhfa-shafawi')) {
        classes.push('tajweed-ikhfa-shafawi');
    }
    if (ruleIds.includes('qalaqah')) {
        classes.push('tajweed-qalaqah');
    }
    if (ruleIds.includes('madda-normal')) {
        classes.push('tajweed-madda-normal');
    }
    if (ruleIds.includes('madda-permissible')) {
        classes.push('tajweed-madda-permissible');
    }
    if (ruleIds.includes('madda-necessary')) {
        classes.push('tajweed-madda-necessary');
    }
    if (ruleIds.includes('madda-obligatory')) {
        classes.push('tajweed-madda-obligatory');
    }
    if (ruleIds.includes('hamza-wasl')) {
        classes.push('tajweed-hamza-wasl');
    }
    if (ruleIds.includes('silent')) {
        classes.push('tajweed-silent');
    }
    if (ruleIds.includes('laam-shamsiyah')) {
        classes.push('tajweed-laam-shamsiyah');
    }
    if (ruleIds.includes('iqlab')) {
        classes.push('tajweed-iqlab');
    }

    return classes.join(' ');
} 