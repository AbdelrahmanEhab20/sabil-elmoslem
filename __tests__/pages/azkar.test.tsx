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
            <div data-testid="modal">
                <h2 data-testid="modal-title">{title}</h2>
                {children}
                <button onClick={onClose} data-testid="modal-close">Close</button>
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

            // Wait for content to load first
            await waitFor(() => {
                expect(screen.getByText(/سبحان الله/)).toBeInTheDocument()
            }, WAIT_TIMEOUT)

            // Then check for category filter - it can be in select option or button
            // Use getAllByText since it might appear in multiple places
            await waitFor(() => {
                const allCategoriesElements = screen.getAllByText(/All Categories/i)
                expect(allCategoriesElements.length).toBeGreaterThan(0)
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
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)

            const countButtons = screen.getAllByText(/Count/i)
            expect(countButtons.length).toBeGreaterThan(0)

            await user.click(countButtons[0])

            // Wait for counter to update - check for "1 of" pattern which is more flexible
            await waitFor(() => {
                const progressText = screen.getByText(/1 of/)
                expect(progressText).toBeInTheDocument()
            }, { timeout: 10000 })
        }, 15000)

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

        test('displays reset all counters button when counters exist', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            // Wait for content to load
            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)

            // Increment a counter to make it exist
            const countButtons = screen.getAllByText(/Count/i)
            expect(countButtons.length).toBeGreaterThan(0)
            await user.click(countButtons[0])

            // Wait for counter to update first - this ensures state has updated
            await waitFor(() => {
                expect(screen.getByText(/1 of/)).toBeInTheDocument()
            }, { timeout: 10000 })

            // Then wait for reset all section to appear (it appears when Object.keys(counters).length > 0)
            // The section contains the text "Reset All Counters"
            await waitFor(() => {
                expect(screen.getByText(/Reset All Counters/i)).toBeInTheDocument()
            }, { timeout: 10000 })
            
            // Verify the button exists
            const resetAllButtons = screen.getAllByRole('button', { name: /Reset All/i })
            expect(resetAllButtons.length).toBeGreaterThan(0)
        }, 25000)

        test('opens confirmation modal when reset all is clicked', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            // Wait for content to load and increment a counter
            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)

            const countButtons = screen.getAllByText(/Count/i)
            expect(countButtons.length).toBeGreaterThan(0)
            await user.click(countButtons[0])

            // Wait for counter to update first
            await waitFor(() => {
                expect(screen.getByText(/1 of/)).toBeInTheDocument()
            }, { timeout: 10000 })

            // Wait for reset all section to appear
            await waitFor(() => {
                expect(screen.getByText(/Reset All Counters/i)).toBeInTheDocument()
            }, { timeout: 10000 })

            // Find the reset all button - it's in the controls section, not in modal
            // Get all buttons with "Reset All" text and find the one NOT in a modal
            const resetAllButtons = screen.getAllByRole('button', { name: /Reset All/i })
            expect(resetAllButtons.length).toBeGreaterThan(0)
            
            // The first one should be the control button (before modal opens)
            const resetAllButton = resetAllButtons[0]
            await user.click(resetAllButton)

            // Check for confirmation modal
            await waitFor(() => {
                expect(screen.getByTestId('modal')).toBeInTheDocument()
                expect(screen.getByText(/Confirm Reset/i)).toBeInTheDocument()
                expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
            }, { timeout: 10000 })
        }, 30000)

        test('resets all counters when confirmed', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            // Wait for content to load and increment counters
            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            }, WAIT_TIMEOUT)

            const countButtons = screen.getAllByText(/Count/i)
            expect(countButtons.length).toBeGreaterThan(0)
            await user.click(countButtons[0])
            
            // Wait for counter to update first
            await waitFor(() => {
                expect(screen.getByText(/1 of/)).toBeInTheDocument()
            }, { timeout: 10000 })

            // Wait for reset all section to appear
            await waitFor(() => {
                expect(screen.getByText(/Reset All Counters/i)).toBeInTheDocument()
            }, { timeout: 10000 })

            // Click reset all button - get the first one (control button)
            const resetAllButtons = screen.getAllByRole('button', { name: /Reset All/i })
            expect(resetAllButtons.length).toBeGreaterThan(0)
            const resetAllButton = resetAllButtons[0]
            await user.click(resetAllButton)

            // Wait for modal to appear
            await waitFor(() => {
                expect(screen.getByTestId('modal')).toBeInTheDocument()
                expect(screen.getByText(/Confirm Reset/i)).toBeInTheDocument()
            }, { timeout: 10000 })

            // Find the confirm button in the modal - there will be multiple "Reset All" buttons now
            // Get all buttons and find the one in the modal
            const modal = screen.getByTestId('modal')
            const modalButtons = Array.from(modal.querySelectorAll('button'))
            const confirmButton = modalButtons.find(btn => 
                btn.textContent?.includes('Reset All')
            )
            
            expect(confirmButton).toBeInTheDocument()
            if (confirmButton) {
                await user.click(confirmButton)
            }

            // Verify toast was called
            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'success'
                    })
                )
            }, { timeout: 10000 })
        }, 35000)
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
