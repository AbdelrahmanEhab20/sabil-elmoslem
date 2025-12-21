/**
 * Qibla Page Tests
 * 
 * Tests the core functionality of the Qibla page
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QiblaPage from '@/app/qibla/page'

// Mock the UserContext
const mockSetLocation = jest.fn()
jest.mock('../../src/contexts/UserContext', () => ({
    useUser: () => ({
        location: { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
        setLocation: mockSetLocation,
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
const mockGetCurrentLocation = jest.fn()
const mockSearchCityCoordinates = jest.fn()
const mockGetCitySuggestions = jest.fn()
jest.mock('@/utils/api', () => ({
    getCurrentLocation: (...args: any[]) => mockGetCurrentLocation(...args),
    searchCityCoordinates: (...args: any[]) => mockSearchCityCoordinates(...args),
    getCitySuggestions: (...args: any[]) => mockGetCitySuggestions(...args)
}))

// Mock QiblaCompass component
jest.mock('@/components/QiblaCompass', () => {
    return function MockQiblaCompass({ qiblaDirection }: any) {
        return (
            <div data-testid="qibla-compass">
                <span>Qibla Direction: {qiblaDirection}°</span>
            </div>
        )
    }
})

// Increase timeout for async operations
const WAIT_TIMEOUT = { timeout: 5000 }

describe('QiblaPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockShowToast.mockClear()
        mockSetLocation.mockClear()
        mockGetCurrentLocation.mockResolvedValue({
            latitude: 30.0444,
            longitude: 31.2357,
            city: 'Cairo',
            country: 'Egypt'
        })
        mockSearchCityCoordinates.mockResolvedValue({
            latitude: 24.7136,
            longitude: 46.6753,
            city: 'Riyadh',
            country: 'Saudi Arabia'
        })
        mockGetCitySuggestions.mockResolvedValue([
            {
                name: 'Riyadh',
                country: 'Saudi Arabia',
                coordinates: [24.7136, 46.6753]
            }
        ])
    })

    describe('Rendering Tests', () => {
        test('renders qibla page', async () => {
            render(<QiblaPage />)

            await waitFor(() => {
                expect(screen.getByTestId('qibla-compass')).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('displays current location', async () => {
            render(<QiblaPage />)

            await waitFor(() => {
                expect(screen.getByText(/Cairo/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('shows qibla compass', async () => {
            render(<QiblaPage />)

            await waitFor(() => {
                const compass = screen.getByTestId('qibla-compass')
                expect(compass).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })
    })

    describe('Location Search', () => {
        test('displays search input', async () => {
            render(<QiblaPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Search city/i)
                expect(searchInput).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('searches for city when form is submitted', async () => {
            const user = userEvent.setup()
            render(<QiblaPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Search city/i)
                expect(searchInput).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            const searchInput = screen.getByPlaceholderText(/Search city/i)
            await user.type(searchInput, 'Riyadh')
            await user.keyboard('{Enter}')

            await waitFor(() => {
                expect(mockSearchCityCoordinates).toHaveBeenCalled()
            }, WAIT_TIMEOUT)
        })
    })

    describe('Current Location', () => {
        test('has button to use current location', async () => {
            render(<QiblaPage />)

            await waitFor(() => {
                const button = screen.getByText(/Use Current Location/i)
                expect(button).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('gets current location when button clicked', async () => {
            const user = userEvent.setup()
            render(<QiblaPage />)

            await waitFor(() => {
                const button = screen.getByText(/Use Current Location/i)
                expect(button).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            const button = screen.getByText(/Use Current Location/i)
            await user.click(button)

            await waitFor(() => {
                expect(mockGetCurrentLocation).toHaveBeenCalled()
            }, WAIT_TIMEOUT)
        })
    })

    describe('Error Handling', () => {
        test('calls toast on location error', async () => {
            // Reset mocks
            mockGetCurrentLocation.mockReset()
            mockGetCurrentLocation.mockRejectedValueOnce(new Error('Location Error'))

            render(<QiblaPage />)

            // Wait a bit for the useEffect to run
            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'error'
                    })
                )
            }, { timeout: 10000 })
        }, 15000)

        test('calls toast on city search error', async () => {
            const user = userEvent.setup()
            mockSearchCityCoordinates.mockReset()
            mockSearchCityCoordinates.mockRejectedValueOnce(new Error('City not found'))

            render(<QiblaPage />)

            await waitFor(() => {
                const searchInput = screen.queryByPlaceholderText(/Search city/i) || screen.queryByPlaceholderText(/city/i)
                expect(searchInput).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            const searchInput = screen.queryByPlaceholderText(/Search city/i) || screen.queryByPlaceholderText(/city/i)
            if (searchInput) {
                await user.type(searchInput, 'InvalidCity')
                await user.keyboard('{Enter}')

                await waitFor(() => {
                    expect(mockShowToast).toHaveBeenCalledWith(
                        expect.objectContaining({
                            type: 'error'
                        })
                    )
                }, { timeout: 10000 })
            }
        }, 15000)
    })

    describe('Responsive Design', () => {
        test('renders with responsive container class', async () => {
            render(<QiblaPage />)

            await waitFor(() => {
                const container = document.querySelector('.min-h-screen')
                expect(container).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })
    })
})

