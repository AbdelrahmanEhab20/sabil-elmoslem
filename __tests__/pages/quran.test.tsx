/**
 * Quran Page Tests
 * 
 * Tests the core functionality of the Quran page
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuranPage from '@/app/quran/page'

// Mock the UserContext
jest.mock('../../src/contexts/UserContext', () => ({
    useUser: () => ({
        preferences: {
            language: 'en',
            theme: 'light'
        }
    })
}))

// Mock the ToastProvider
const mockShowToast = jest.fn()
jest.mock('../../src/components/ToastProvider', () => ({
    useToast: () => ({
        showToast: mockShowToast
    })
}))

// Mock the API functions
const mockFetchQuranSurahs = jest.fn()
const mockFetchQuranAyahs = jest.fn()
jest.mock('@/utils/api', () => ({
    fetchQuranSurahs: (...args: any[]) => mockFetchQuranSurahs(...args),
    fetchQuranAyahs: (...args: any[]) => mockFetchQuranAyahs(...args)
}))

// Mock AudioPlayer component
jest.mock('@/components/AudioPlayer', () => {
    return function MockAudioPlayer({ src, onEnded }: any) {
        return (
            <div data-testid="audio-player">
                <audio src={src} onEnded={onEnded} />
            </div>
        )
    }
})

// Test data
const mockSurahs = [
    {
        number: 1,
        name: 'Al-Fatihah',
        englishName: 'The Opening',
        numberOfAyahs: 7,
        revelationType: 'Meccan'
    },
    {
        number: 2,
        name: 'Al-Baqarah',
        englishName: 'The Cow',
        numberOfAyahs: 286,
        revelationType: 'Medinan'
    }
]

const mockAyahs = [
    {
        number: 1,
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        numberInSurah: 1,
        juz: 1,
        manzil: 1,
        page: 1,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false
    },
    {
        number: 2,
        text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        numberInSurah: 2,
        juz: 1,
        manzil: 1,
        page: 1,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false
    }
]

// Increase timeout for async operations
const WAIT_TIMEOUT = { timeout: 5000 }

describe('QuranPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockShowToast.mockClear()
        mockFetchQuranSurahs.mockResolvedValue(mockSurahs)
        mockFetchQuranAyahs.mockResolvedValue(mockAyahs)
        // Clear localStorage before each test
        if (typeof window !== 'undefined') {
            localStorage.clear()
        }
    })

    describe('Rendering Tests', () => {
        test('renders quran page and loads surahs', async () => {
            render(<QuranPage />)

            await waitFor(() => {
                expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('displays surah list', async () => {
            render(<QuranPage />)

            await waitFor(() => {
                expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument()
                expect(screen.getByText(/Al-Baqarah/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('shows surah information', async () => {
            render(<QuranPage />)

            await waitFor(() => {
                expect(screen.getByText(/The Opening/i)).toBeInTheDocument()
                expect(screen.getByText(/7/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })
    })

    describe('Surah Selection', () => {
        test('opens surah when clicked', async () => {
            const user = userEvent.setup()
            render(<QuranPage />)

            await waitFor(() => {
                expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            const surahButton = screen.getByText(/Al-Fatihah/i).closest('button') || screen.getByText(/Al-Fatihah/i)
            await user.click(surahButton)

            // Wait for ayahs to load
            await waitFor(() => {
                expect(mockFetchQuranAyahs).toHaveBeenCalled()
            }, WAIT_TIMEOUT)
        })
    })

    describe('Search Functionality', () => {
        test('displays search input', async () => {
            render(<QuranPage />)

            await waitFor(() => {
                expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            // Search input might be in sidebar or main view
            const searchInput = screen.queryByPlaceholderText(/Search surahs/i) || screen.queryByPlaceholderText(/Search/i)
            expect(searchInput).toBeInTheDocument()
        })

        test('filters surahs by search term', async () => {
            const user = userEvent.setup()
            render(<QuranPage />)

            await waitFor(() => {
                expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            const searchInput = screen.queryByPlaceholderText(/Search surahs/i) || screen.queryByPlaceholderText(/Search/i)
            if (searchInput) {
                await user.type(searchInput, 'Fatihah')

                await waitFor(() => {
                    expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument()
                    // Al-Baqarah should be filtered out
                    expect(screen.queryByText(/Al-Baqarah/i)).not.toBeInTheDocument()
                }, { timeout: 10000 })
            }
        })
    })

    describe('Error Handling', () => {
        test('calls toast on API error', async () => {
            mockFetchQuranSurahs.mockRejectedValueOnce(new Error('API Error'))

            render(<QuranPage />)

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'error'
                    })
                )
            }, WAIT_TIMEOUT)
        })
    })

    describe('Responsive Design', () => {
        test('renders with responsive container class', async () => {
            render(<QuranPage />)

            await waitFor(() => {
                const container = document.querySelector('.min-h-screen')
                expect(container).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })
    })
})

