/**
 * Azkar Page Tests
 * 
 * Tests the core functionality of the Azkar (remembrance) page
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AzkarPage from '@/app/azkar/page'

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
const mockFetchAzkar = jest.fn()
jest.mock('@/utils/api', () => ({
    fetchAzkar: (...args: any[]) => mockFetchAzkar(...args)
}))

// Mock CustomModal component
jest.mock('@/components/CustomModal', () => {
    return function MockModal({ isOpen, onClose, title, children }: any) {
        if (!isOpen) return null
        return (
            <div data-testid="congrats-modal">
                <h2>{title}</h2>
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        )
    }
})

// Test data
const mockAzkarData = [
    {
        id: 1,
        category: 'Morning Adhkar',
        count: '3',
        description: 'Say after waking up',
        reference: 'Bukhari',
        content: 'سبحان الله'
    },
    {
        id: 2,
        category: 'Morning Adhkar',
        count: '1',
        description: 'Morning remembrance',
        reference: 'Muslim',
        content: 'الحمد لله'
    },
    {
        id: 3,
        category: 'Evening Adhkar',
        count: '3',
        description: 'Evening remembrance',
        reference: 'Tirmidhi',
        content: 'الله أكبر'
    }
]

// Increase timeout for async operations
const WAIT_TIMEOUT = { timeout: 5000 }

describe('AzkarPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockShowToast.mockClear()
        mockFetchAzkar.mockResolvedValue(mockAzkarData)
        // Clear localStorage before each test
        if (typeof window !== 'undefined') {
            localStorage.clear()
        }
    })

    describe('Rendering Tests', () => {
        test('renders azkar page and loads content', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/سبحان الله/)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('displays category filter with All Categories button', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/All Categories/i)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('shows multiple azkar content items', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/سبحان الله/)).toBeInTheDocument()
                expect(screen.getByText(/الحمد لله/)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })
    })

    describe('Counter Functionality', () => {
        test('displays count buttons for azkar', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)
        })

        test('increments counter on button click', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getAllByText(/Count/i).length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)

            const countButtons = screen.getAllByText(/Count/i)
            await user.click(countButtons[0])

            await waitFor(() => {
                expect(screen.getByText(/1 of 3/)).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })

        test('shows progress text', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getAllByText(/of 3/).length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)
        })
    })

    describe('Reset Functionality', () => {
        test('displays reset buttons with proper title', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                const resetButtons = screen.getAllByTitle(/Reset this dhikr/i)
                expect(resetButtons.length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)
        })
    })

    describe('Category Filtering', () => {
        test('shows category filter buttons', async () => {
            render(<AzkarPage />)

            // Wait for content to load first
            await waitFor(() => {
                expect(screen.getByText(/سبحان الله/)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            // Then check for category buttons
            await waitFor(() => {
                const allCategories = screen.getAllByText(/All Categories/i)
                expect(allCategories.length).toBeGreaterThan(0)
                const morningAdhkar = screen.getAllByText(/Morning Adhkar/i)
                expect(morningAdhkar.length).toBeGreaterThan(0)
            }, { timeout: 3000 })
        })
    })

    describe('Error Handling', () => {
        test('calls toast on API error', async () => {
            mockFetchAzkar.mockRejectedValueOnce(new Error('API Error'))

            render(<AzkarPage />)

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
            render(<AzkarPage />)

            await waitFor(() => {
                const container = document.querySelector('.max-w-6xl')
                expect(container).toBeInTheDocument()
            }, WAIT_TIMEOUT)
        })
    })
})
