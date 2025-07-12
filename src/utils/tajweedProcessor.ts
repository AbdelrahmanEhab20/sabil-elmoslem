import { TajweedRule, TajweedWord, TajweedLetter } from '@/types';

// Tajweed rules patterns and logic
export class TajweedProcessor {
    private rules: TajweedRule[];

    constructor(rules: TajweedRule[]) {
        this.rules = rules;
    }

    // Process Arabic text and return words with Tajweed rules
    processText(text: string): TajweedWord[] {
        // Split text into words (Arabic words are separated by spaces and punctuation)
        const words = this.splitIntoWords(text);

        // Flatten to get all letters with their global index
        let globalIndex = 0;
        const allLetters: { char: string; letterIdx: number; globalIdx: number }[] = [];
        words.forEach((word) => {
            for (let i = 0; i < word.text.length; i++) {
                allLetters.push({ char: word.text[i], letterIdx: i, globalIdx: globalIndex++ });
            }
            // Add a space as a separator (not colored)
            allLetters.push({ char: ' ', letterIdx: word.text.length, globalIdx: globalIndex++ });
        });

        // Precompute context-aware rules for complex Tajweed rules
        const contextRulesMap: Record<number, TajweedRule[]> = {};

        for (let i = 0; i < allLetters.length - 1; i++) {
            const curr = allLetters[i];
            const next = allLetters[i + 1];

            // Skip spaces
            if (curr.char === ' ' || next.char === ' ') continue;

            // Ikhfa: Noon Sakinah or Tanween followed by specific letters (ص ذ ث ك ج ش ق س د ت ض ظ ز ف)
            if ((curr.char === '\u0646' && this.isSakinah(curr, allLetters) && /[صذثكجشقسدتضظزف]/.test(next.char)) ||
                (curr.char.match(/[\u064B-\u064D]/) && /[صذثكجشقسدتضظزف]/.test(next.char))) {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('ikhfa')];
            }

            // Ikhfa Shafawi: Meem Sakinah followed by ب
            if (curr.char === '\u0645' && this.isSakinah(curr, allLetters) && next.char === '\u0628') {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('ikhfa-shafawi')];
            }

            // Idgham Shafawi: Meem Sakinah followed by م
            if (curr.char === '\u0645' && this.isSakinah(curr, allLetters) && next.char === '\u0645') {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('idgham-shafawi')];
            }

            // Iqlab: Noon Sakinah or Tanween followed by ب
            if ((curr.char === '\u0646' && this.isSakinah(curr, allLetters) && next.char === '\u0628') ||
                (curr.char.match(/[\u064B-\u064D]/) && next.char === '\u0628')) {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('iqlab')];
            }

            // Idgham with Ghunnah: Noon Sakinah or Tanween followed by ي ن م و
            if ((curr.char === '\u0646' && this.isSakinah(curr, allLetters) && /[ينمو]/.test(next.char)) ||
                (curr.char.match(/[\u064B-\u064D]/) && /[ينمو]/.test(next.char))) {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('idgham-with-ghunnah')];
            }

            // Idgham without Ghunnah: Noon Sakinah or Tanween followed by ل ر
            if ((curr.char === '\u0646' && this.isSakinah(curr, allLetters) && /[لر]/.test(next.char)) ||
                (curr.char.match(/[\u064B-\u064D]/) && /[لر]/.test(next.char))) {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('idgham-without-ghunnah')];
            }

            // Idgham Mutajanisayn: Similar letters (ت د ط, ث ذ ظ, ب م, ف و)
            if (this.isMutajanisayn(curr.char, next.char)) {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('idgham-mutajanisayn')];
            }

            // Idgham Mutaqaribayn: Close letters (ق ك, ل ر, ف و)
            if (this.isMutaqaribayn(curr.char, next.char)) {
                contextRulesMap[curr.globalIdx] = [this.getRuleById('idgham-mutaqaribayn')];
            }
        }

        // Now build TajweedWord[] with per-letter rules
        globalIndex = 0;
        return words.map((word) => {
            const letters: TajweedLetter[] = [];
            for (let i = 0; i < word.text.length; i++) {
                const char = word.text[i];
                let rules = this.analyzeLetter(char, i, word.text);

                // Add context-aware rules
                if (contextRulesMap[globalIndex]) {
                    rules = [...rules, ...contextRulesMap[globalIndex]];
                }

                letters.push({ char, tajweedRules: Array.from(new Set(rules)), index: i });
                globalIndex++;
            }
            // Skip the space
            globalIndex++;
            const tajweedRules = Array.from(new Set(letters.flatMap(l => l.tajweedRules)));
            return {
                text: word.text,
                tajweedRules,
                startIndex: word.startIndex,
                endIndex: word.endIndex,
                letters
            };
        });
    }

    // Check if a letter is Sakinah (has sukoon)
    private isSakinah(letter: { char: string; letterIdx: number; globalIdx: number }, allLetters: Array<{ char: string; letterIdx: number; globalIdx: number }>): boolean {
        const word = allLetters.filter(l => l.letterIdx === letter.letterIdx);
        const nextInWord = word[letter.letterIdx + 1];

        // Check if next character is sukoon
        return nextInWord && nextInWord.char === '\u0652';
    }

    // Check if two letters are Mutajanisayn (similar articulation point)
    private isMutajanisayn(char1: string, char2: string): boolean {
        const mutajanisaynGroups = [
            ['\u062A', '\u062F', '\u0637'], // ت د ط
            ['\u062B', '\u0630', '\u0638'], // ث ذ ظ
            ['\u0628', '\u0645'], // ب م
            ['\u0641', '\u0648']  // ف و
        ];

        return mutajanisaynGroups.some(group => group.includes(char1) && group.includes(char2));
    }

    // Check if two letters are Mutaqaribayn (close articulation point)
    private isMutaqaribayn(char1: string, char2: string): boolean {
        const mutaqaribaynGroups = [
            ['\u0642', '\u0643'], // ق ك
            ['\u0644', '\u0631'], // ل ر
            ['\u0641', '\u0648']  // ف و
        ];

        return mutaqaribaynGroups.some(group => group.includes(char1) && group.includes(char2));
    }

    // Split text into words while preserving positions
    private splitIntoWords(text: string): Array<{ text: string; startIndex: number; endIndex: number }> {
        const words: Array<{ text: string; startIndex: number; endIndex: number }> = [];
        let currentWord = '';
        let startIndex = 0;
        let inWord = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Check if character is Arabic letter, number, or special Quranic character
            if (this.isArabicChar(char) || this.isQuranicChar(char)) {
                if (!inWord) {
                    startIndex = i;
                    inWord = true;
                }
                currentWord += char;
            } else {
                // End of word
                if (inWord && currentWord.trim()) {
                    words.push({
                        text: currentWord.trim(),
                        startIndex,
                        endIndex: i - 1
                    });
                    currentWord = '';
                    inWord = false;
                }
            }
        }

        // Handle last word
        if (inWord && currentWord.trim()) {
            words.push({
                text: currentWord.trim(),
                startIndex,
                endIndex: text.length - 1
            });
        }

        return words;
    }

    // Check if character is Arabic
    private isArabicChar(char: string): boolean {
        const arabicRange = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        return arabicRange.test(char);
    }

    // Check if character is Quranic (includes special marks)
    private isQuranicChar(char: string): boolean {
        const quranicMarks = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u08D4-\u08FE]/;
        return quranicMarks.test(char);
    }

    // Analyze a letter for Tajweed rules (context-aware)
    private analyzeLetter(char: string, charIndex: number, word: string): TajweedRule[] {
        const rules: TajweedRule[] = [];

        // Madd sign (ۤ, U+06E4) above a letter: apply madda-obligatory ONLY to that letter
        if (word[charIndex + 1] === '\u06E4') {
            rules.push(this.getRuleById('madda-obligatory'));
        }

        // Ghunnah: ن or م with shadda
        if ((char === '\u0646' || char === '\u0645') && word[charIndex + 1] === '\u0651') {
            rules.push(this.getRuleById('ghunnah'));
        }

        // Qalaqah: ق ط ب ج د with sukoon
        if ('\u0642\u0637\u0628\u062C\u062F'.includes(char) && word[charIndex + 1] === '\u0652') {
            rules.push(this.getRuleById('qalaqah'));
        }

        // Madda Normal: Alif, Waw, or Ya after matching harakah
        if (
            (char === '\u0627' && charIndex > 0 && /[\u064E\u0650\u064F]/.test(word[charIndex - 1])) || // Alif after fatha, kasra, damma
            (char === '\u0648' && charIndex > 0 && word[charIndex - 1] === '\u064F') || // Waw after damma
            (char === '\u064A' && charIndex > 0 && word[charIndex - 1] === '\u0650')    // Ya after kasra
        ) {
            rules.push(this.getRuleById('madda-normal'));
        }

        // Madda Permissible: Alif madda (آ)
        if (char === '\u0622') {
            rules.push(this.getRuleById('madda-permissible'));
        }

        // Madda Necessary: Alif followed by shadda or in specific words (e.g., الضَّالِّينَ)
        if (
            (char === '\u0627' && word[charIndex + 1] === '\u0651') ||
            (word.includes('\u0627\u0644\u0636\u064E\u0644\u064A\u0646\u064E'))
        ) {
            rules.push(this.getRuleById('madda-necessary'));
        }

        // Madda Obligatory: Alif madda (آ) followed by shadda, or in disconnected letters (handled above with Madd sign)
        const disconnectedLetterWords = [
            'الۤمۤ', 'كهيعص', 'طه', 'طسم', 'يس', 'ص', 'ق', 'ن', 'حم', 'عسق', 'حمۤ', 'حمۤ عسق'
        ];
        if (
            (char === '\u0622' && word[charIndex + 1] === '\u0651') ||
            disconnectedLetterWords.some(dl => word.replace(/\s/g, '') === dl.replace(/\s/g, ''))
        ) {
            // Only apply if not already applied by Madd sign
            if (!rules.some(r => r.id === 'madda-obligatory')) {
                rules.push(this.getRuleById('madda-obligatory'));
            }
        }

        // Lam Shamsiyyah: ل followed by شمسية letters
        if (char === '\u0644' && charIndex + 1 < word.length && /[تثدذرزسشصضطظلن]/.test(word[charIndex + 1])) {
            rules.push(this.getRuleById('laam-shamsiyah'));
        }

        // Hamza Wasl: ا at the start of a word (with or without kasra/damma)
        if (charIndex === 0 && char === '\u0627') {
            rules.push(this.getRuleById('hamza-wasl'));
        }

        // Silent: Any letter with sukoon
        if (word[charIndex + 1] === '\u0652') {
            rules.push(this.getRuleById('silent'));
        }

        return rules;
    }

    // Get rule by ID
    private getRuleById(id: string): TajweedRule {
        const rule = this.rules.find(r => r.id === id);
        if (!rule) {
            throw new Error(`Tajweed rule with ID '${id}' not found`);
        }
        return rule;
    }
}

// Factory function to create TajweedProcessor with default rules
export async function createTajweedProcessor(): Promise<TajweedProcessor> {
    try {
        const rulesData = await import('@/data/tajweed-rules.json');
        return new TajweedProcessor(rulesData.rules);
    } catch (error) {
        console.error('Failed to load Tajweed rules:', error);
        return new TajweedProcessor([]);
    }
} 