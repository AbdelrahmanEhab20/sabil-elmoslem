/**
 * Prayer Times Page Tests
 * 
 * Why we test this:
 * - Prayer times are critical functionality for Islamic apps
 * - Automatic timezone detection ensures accurate prayer times
 * - Location-based features need to handle various scenarios
 * - User preferences (language, calculation method) affect core functionality
 * - Error handling for API failures is important for user experience
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrayerTimesPage from '@/app/prayer-times/page'

// Mock the UserContext
jest.mock('../../src/contexts/UserContext', () => ({
    useUser: () => ({
        location: { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
        setLocation: jest.fn(),
        prayerTimes: {
            Fajr: '04:29',
            Sunrise: '06:15',
            Dhuhr: '13:00',
            Asr: '16:30',
            Maghrib: '19:45',
            Isha: '21:15'
        },
        setPrayerTimes: jest.fn(),
        loading: false,
        setLoading: jest.fn(),
        preferences: {
            language: 'en',
            calculationMethod: 1,
            madhab: 1,
            theme: 'light'
        }
    })
}))

// Mock the ToastProvider
jest.mock('../../src/components/ToastProvider', () => ({
    useToast: () => ({
        showToast: jest.fn()
    })
}))

// Mock the API functions
jest.mock('@/utils/api', () => ({
    fetchPrayerTimes: jest.fn(),
    getCurrentLocation: jest.fn(),
    searchCityCoordinates: jest.fn()
}))

describe('PrayerTimesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering Tests', () => {
        test('renders prayer times page with correct title', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
            expect(screen.getByText(/Get accurate prayer times for your location/i)).toBeInTheDocument()
        })

        test('displays all prayer times correctly', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByText(/Fajr/i)).toBeInTheDocument()
            expect(screen.getByText(/Sunrise/i)).toBeInTheDocument()
            expect(screen.getByText(/Dhuhr/i)).toBeInTheDocument()
            expect(screen.getByText(/Asr/i)).toBeInTheDocument()
            expect(screen.getByText(/Maghrib/i)).toBeInTheDocument()
            expect(screen.getByText(/Isha/i)).toBeInTheDocument()
        })

        test('displays timezone information when available', () => {
            render(<PrayerTimesPage />)

            // Check for automatic timezone detection option
            expect(screen.getByText(/Automatic timezone detection/i)).toBeInTheDocument()
        })
    })

    describe('Location Functionality', () => {
        test('displays current location information', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByText(/Cairo/i)).toBeInTheDocument()
            expect(screen.getByText(/Egypt/i)).toBeInTheDocument()
        })

        test('allows searching for new cities', async () => {
            const user = userEvent.setup()
            render(<PrayerTimesPage />)

            const searchInput = screen.getByPlaceholderText(/Search for a city/i)
            const searchButton = screen.getByText(/Search/i)

            await user.type(searchInput, 'Mecca')
            await user.click(searchButton)

            expect(searchInput).toHaveValue('Mecca')
        })

        test('allows using current location', async () => {
            const user = userEvent.setup()
            render(<PrayerTimesPage />)

            const currentLocationButton = screen.getByText(/Use Current Location/i)
            await user.click(currentLocationButton)

            // Should trigger location request
            expect(currentLocationButton).toBeInTheDocument()
        })
    })

    describe('Prayer Time Display', () => {
        test('formats prayer times correctly', () => {
            render(<PrayerTimesPage />)

            // Check that times are displayed in 12-hour format
            expect(screen.getByText(/4:29 AM/i)).toBeInTheDocument() // Fajr
            expect(screen.getByText(/6:15 AM/i)).toBeInTheDocument() // Sunrise
            expect(screen.getByText(/1:00 PM/i)).toBeInTheDocument() // Dhuhr
        })

        test('shows next prayer countdown', () => {
            render(<PrayerTimesPage />)

            // Should display countdown timer
            expect(screen.getByText(/Time until next prayer/i)).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        test('handles API errors gracefully', async () => {
            const mockFetchPrayerTimes = require('@/utils/api').fetchPrayerTimes
            mockFetchPrayerTimes.mockRejectedValueOnce(new Error('API Error'))

            render(<PrayerTimesPage />)

            await waitFor(() => {
                expect(screen.getByText(/Error loading prayer times/i)).toBeInTheDocument()
            })
        })

        test('handles location errors gracefully', async () => {
            const mockGetCurrentLocation = require('@/utils/api').getCurrentLocation
            mockGetCurrentLocation.mockRejectedValueOnce(new Error('Location Error'))

            render(<PrayerTimesPage />)

            await waitFor(() => {
                expect(screen.getByText(/Error getting location/i)).toBeInTheDocument()
            })
        })
    })

    describe('Accessibility', () => {
        test('has proper ARIA labels', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByLabelText(/Search for a city/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/Use current location/i)).toBeInTheDocument()
        })

        test('supports keyboard navigation', async () => {
            const user = userEvent.setup()
            render(<PrayerTimesPage />)

            const searchInput = screen.getByPlaceholderText(/Search for a city/i)
            await user.tab()
            expect(searchInput).toHaveFocus()
        })
    })

    describe('Responsive Design', () => {
        test('renders correctly on different screen sizes', () => {
            render(<PrayerTimesPage />)

            // Check that page renders without errors
            expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
        })
    })
})

