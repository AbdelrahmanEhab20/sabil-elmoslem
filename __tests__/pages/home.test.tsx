/**
 * Home Page Tests
 * 
 * Tests the core functionality of the Home page
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePageClient from '@/app/HomePageClient'

// Mock the UserContext
jest.mock('../../src/contexts/UserContext', () => ({
    useUser: () => ({
        preferences: {
            language: 'en',
            theme: 'light'
        },
        location: { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
        prayerTimes: {
            Fajr: '04:29',
            Sunrise: '06:15',
            Dhuhr: '13:00',
            Asr: '16:30',
            Maghrib: '19:45',
            Isha: '21:15'
        }
    })
}))

// Mock PrayerTimesCard component
jest.mock('@/components/PrayerTimesCard', () => {
    return function MockPrayerTimesCard() {
        return <div data-testid="prayer-times-card">Prayer Times Card</div>
    }
})

// Mock Next.js Link and Image
jest.mock('next/link', () => {
    return function MockLink({ children, href }: any) {
        return <a href={href}>{children}</a>
    }
})

jest.mock('next/image', () => {
    return function MockImage({ src, alt }: any) {
        return <img src={src} alt={alt} />
    }
})

// Increase timeout for async operations
const WAIT_TIMEOUT = { timeout: 5000 }

describe('HomePageClient', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering Tests', () => {
        test('renders home page', () => {
            render(<HomePageClient />)
            expect(screen.getByTestId('prayer-times-card')).toBeInTheDocument()
        })

        test('displays main features', async () => {
            render(<HomePageClient />)

            await waitFor(() => {
                expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
                expect(screen.getByText(/Azkar/i)).toBeInTheDocument()
                expect(screen.getByText(/Quran/i)).toBeInTheDocument()
                expect(screen.getByText(/Qibla/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('displays feature links', async () => {
            render(<HomePageClient />)

            // Wait for features to render
            await waitFor(() => {
                expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            // Check links exist
            const prayerLink = screen.getByText(/Prayer Times/i).closest('a')
            expect(prayerLink).toBeInTheDocument()
            if (prayerLink) {
                expect(prayerLink).toHaveAttribute('href', '/prayer-times')
            }

            const azkarLink = screen.getByText(/Azkar/i).closest('a')
            expect(azkarLink).toBeInTheDocument()
            if (azkarLink) {
                expect(azkarLink).toHaveAttribute('href', '/azkar')
            }

            const quranLink = screen.getByText(/Quran/i).closest('a')
            expect(quranLink).toBeInTheDocument()
            if (quranLink) {
                expect(quranLink).toHaveAttribute('href', '/quran')
            }

            const qiblaLink = screen.getByText(/Qibla/i).closest('a')
            expect(qiblaLink).toBeInTheDocument()
            if (qiblaLink) {
                expect(qiblaLink).toHaveAttribute('href', '/qibla')
            }
        }, 10000)
    })

    describe('Navigation', () => {
        test('has navigation links to all main pages', async () => {
            render(<HomePageClient />)

            await waitFor(() => {
                expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            // Check all features are present
            expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
            expect(screen.getByText(/Azkar/i)).toBeInTheDocument()
            expect(screen.getByText(/Quran/i)).toBeInTheDocument()
            expect(screen.getByText(/Qibla/i)).toBeInTheDocument()
        }, 10000)
    })

    describe('Prayer Times Card', () => {
        test('displays prayer times card', () => {
            render(<HomePageClient />)
            expect(screen.getByTestId('prayer-times-card')).toBeInTheDocument()
        })
    })

    describe('Responsive Design', () => {
        test('renders with responsive container class', () => {
            render(<HomePageClient />)
            const container = document.querySelector('.min-h-screen')
            expect(container).toBeInTheDocument()
        })
    })
})

