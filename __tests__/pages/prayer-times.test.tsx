/**
 * Prayer Times Page Tests
 * 
 * Tests the core functionality of the Prayer Times page
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrayerTimesPage from '@/app/prayer-times/page'

// Mock the UserContext with complete data
const mockSetLocation = jest.fn()
const mockSetPrayerTimes = jest.fn()
const mockSetLoading = jest.fn()

jest.mock('../../src/contexts/UserContext', () => ({
    useUser: () => ({
        location: { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
        setLocation: mockSetLocation,
        prayerTimes: {
            Fajr: '04:29',
            Sunrise: '06:15',
            Dhuhr: '13:00',
            Asr: '16:30',
            Maghrib: '19:45',
            Isha: '21:15'
        },
        setPrayerTimes: mockSetPrayerTimes,
        loading: false,
        setLoading: mockSetLoading,
        preferences: {
            language: 'en',
            calculationMethod: 1,
            madhab: 1,
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
const mockFetchPrayerTimes = jest.fn()
const mockGetCurrentLocation = jest.fn()
const mockSearchCityCoordinates = jest.fn()
const mockGetCitySuggestions = jest.fn()

jest.mock('@/utils/api', () => ({
    fetchPrayerTimes: (...args: any[]) => mockFetchPrayerTimes(...args),
    getCurrentLocation: (...args: any[]) => mockGetCurrentLocation(...args),
    searchCityCoordinates: (...args: any[]) => mockSearchCityCoordinates(...args),
    getCitySuggestions: (...args: any[]) => mockGetCitySuggestions(...args)
}))

// Mock utility functions
jest.mock('@/utils/dateTime', () => ({
    calculateTimeDifference: jest.fn().mockReturnValue(3600000),
    formatTimeDifference: jest.fn().mockReturnValue('1 hour'),
    getCurrentTimeString: jest.fn().mockReturnValue('12:00')
}))

jest.mock('@/utils/prayerHelpers', () => ({
    findNextPrayer: jest.fn().mockReturnValue({ name: 'Dhuhr', time: '13:00' }),
    getPrayerNameTranslated: jest.fn().mockImplementation((name) => name)
}))

// Increase timeout for async operations
const WAIT_TIMEOUT = { timeout: 5000 }

describe('PrayerTimesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockShowToast.mockClear()
        mockSetLocation.mockClear()
        mockSetPrayerTimes.mockClear()
        mockSetLoading.mockClear()
        
        // Set default mock implementations
        mockFetchPrayerTimes.mockResolvedValue({
            Fajr: '04:29',
            Sunrise: '06:15',
            Dhuhr: '13:00',
            Asr: '16:30',
            Maghrib: '19:45',
            Isha: '21:15',
            timezoneInfo: {
                timezone: 'Africa/Cairo',
                utcOffset: 2
            }
        })
        mockGetCurrentLocation.mockResolvedValue({
            latitude: 30.0444,
            longitude: 31.2357,
            city: 'Cairo',
            country: 'Egypt'
        })
        mockSearchCityCoordinates.mockResolvedValue({
            lat: 30.0444,
            lon: 31.2357,
            city: 'Cairo',
            country: 'Egypt'
        })
        mockGetCitySuggestions.mockResolvedValue([])
    })

    describe('Rendering Tests', () => {
        test('renders prayer times page with title', () => {
            render(<PrayerTimesPage />)
            
            expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
        })

        test('displays all prayer time labels', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByText(/Fajr/i)).toBeInTheDocument()
            expect(screen.getByText(/Dhuhr/i)).toBeInTheDocument()
            expect(screen.getByText(/Asr/i)).toBeInTheDocument()
            expect(screen.getByText(/Maghrib/i)).toBeInTheDocument()
            expect(screen.getByText(/Isha/i)).toBeInTheDocument()
        })

        test('displays location information', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByText(/Cairo/i)).toBeInTheDocument()
        })
    })

    describe('Location Functionality', () => {
        test('has search input for cities', () => {
            render(<PrayerTimesPage />)

            const searchInput = screen.getByPlaceholderText(/Search for a city/i)
            expect(searchInput).toBeInTheDocument()
        })

        test('allows typing in search input', async () => {
            const user = userEvent.setup()
            render(<PrayerTimesPage />)

            const searchInput = screen.getByPlaceholderText(/Search for a city/i)
            await user.type(searchInput, 'Mecca')

            expect(searchInput).toHaveValue('Mecca')
        })
    })

    describe('Timezone Features', () => {
        test('displays timezone option', () => {
            render(<PrayerTimesPage />)

            // Should show automatic timezone option
            expect(screen.getByText(/Automatic timezone/i)).toBeInTheDocument()
        })
    })

    describe('Page Structure', () => {
        test('renders without errors', () => {
            render(<PrayerTimesPage />)

            expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument()
        })

        test('fetches prayer times on mount', async () => {
            render(<PrayerTimesPage />)

            await waitFor(() => {
                expect(mockFetchPrayerTimes).toHaveBeenCalled()
            }, WAIT_TIMEOUT)
        })
    })
})
