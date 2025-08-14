/**
 * Azkar Page Tests
 * 
 * Why we test this:
 * - Counter functionality is core to the Azkar experience
 * - Completion logic and congratulations modal are important user engagement features
 * - Category filtering affects user workflow
 * - Reset functionality must work reliably
 * - Progress tracking is critical for user motivation
 * - Accessibility is important for inclusive design
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
jest.mock('../../src/components/ToastProvider', () => ({
    useToast: () => ({
        showToast: jest.fn()
    })
}))

// Mock the API functions
jest.mock('@/utils/api', () => ({
    fetchAzkar: jest.fn().mockResolvedValue([
        {
            id: 1,
            category: 'Morning Adhkar',
            count: '3',
            description: 'Test morning dhikr',
            reference: 'Bukhari',
            content: 'سبحان الله'
        },
        {
            id: 2,
            category: 'Morning Adhkar',
            count: '1',
            description: 'Test morning dhikr 2',
            reference: 'Muslim',
            content: 'الحمد لله'
        },
        {
            id: 3,
            category: 'Quranic Duas',
            count: '1',
            description: 'Test Quranic dua',
            reference: 'Quran',
            content: 'ربنا آتنا في الدنيا حسنة'
        }
    ])
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

describe('AzkarPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering Tests', () => {
        test('renders azkar page with correct title', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/Azkar/i)).toBeInTheDocument()
            })
        })

        test('displays category filter buttons', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/Morning Adhkar/i)).toBeInTheDocument()
                expect(screen.getByText(/Quranic Duas/i)).toBeInTheDocument()
            })
        })

        test('shows azkar content correctly', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/سبحان الله/i)).toBeInTheDocument()
                expect(screen.getByText(/الحمد لله/i)).toBeInTheDocument()
            })
        })
    })

    describe('Counter Functionality', () => {
        test('increments counter when count button is clicked', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButton = screen.getByText(/Count/i)
                expect(countButton).toBeInTheDocument()
            })

            const countButton = screen.getByText(/Count/i)
            await user.click(countButton)

            expect(screen.getByText('1 of 3')).toBeInTheDocument()
        })

        test('shows progress bar for multi-count azkar', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                const progressBar = screen.getByRole('progressbar', { hidden: true })
                expect(progressBar).toBeInTheDocument()
            })
        })

        test('marks azkar as complete when target count is reached', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButton = screen.getByText(/Count/i)
                expect(countButton).toBeInTheDocument()
            })

            const countButton = screen.getByText(/Count/i)

            // Click 3 times to complete the azkar
            await user.click(countButton)
            await user.click(countButton)
            await user.click(countButton)

            expect(screen.getByText(/Complete/i)).toBeInTheDocument()
        })

        test('disables count button when azkar is complete', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButton = screen.getByText(/Count/i)
                expect(countButton).toBeInTheDocument()
            })

            const countButton = screen.getByText(/Count/i)

            // Complete the azkar
            await user.click(countButton)
            await user.click(countButton)
            await user.click(countButton)

            const completeButton = screen.getByText(/Complete/i)
            expect(completeButton).toBeDisabled()
        })
    })

    describe('Reset Functionality', () => {
        test('resets individual counter when reset button is clicked', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButton = screen.getByText(/Count/i)
                expect(countButton).toBeInTheDocument()
            })

            const countButton = screen.getByText(/Count/i)
            const resetButton = screen.getByTitle(/Reset this dhikr/i)

            // Increment counter
            await user.click(countButton)
            expect(screen.getByText('1 of 3')).toBeInTheDocument()

            // Reset counter
            await user.click(resetButton)
            expect(screen.getByText('0 of 3')).toBeInTheDocument()
        })

        test('resets all counters in category when reset all is clicked', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            })

            const countButtons = screen.getAllByText(/Count/i)
            const resetAllButton = screen.getByText(/Reset All/i)

            // Increment first counter
            await user.click(countButtons[0])
            expect(screen.getByText('1 of 3')).toBeInTheDocument()

            // Reset all
            await user.click(resetAllButton)
            expect(screen.getByText('0 of 3')).toBeInTheDocument()
        })
    })

    describe('Category Filtering', () => {
        test('filters azkar by selected category', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/Morning Adhkar/i)).toBeInTheDocument()
            })

            const quranicDuasButton = screen.getByText(/Quranic Duas/i)
            await user.click(quranicDuasButton)

            // Should only show Quranic Duas
            expect(screen.getByText(/ربنا آتنا في الدنيا حسنة/i)).toBeInTheDocument()
            expect(screen.queryByText(/سبحان الله/i)).not.toBeInTheDocument()
        })

        test('shows correct count of azkar in category', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/2 supplications in this category/i)).toBeInTheDocument()
            })
        })
    })

    describe('Completion Logic', () => {
        test('shows congratulations modal when category is completed', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            })

            const countButtons = screen.getAllByText(/Count/i)

            // Complete all azkar in the category
            for (const button of countButtons) {
                await user.click(button)
                await user.click(button)
                await user.click(button)
            }

            await waitFor(() => {
                expect(screen.getByTestId('congrats-modal')).toBeInTheDocument()
            })
        })

        test('displays random dua in congratulations modal', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButtons = screen.getAllByText(/Count/i)
                expect(countButtons.length).toBeGreaterThan(0)
            })

            const countButtons = screen.getAllByText(/Count/i)

            // Complete all azkar
            for (const button of countButtons) {
                await user.click(button)
                await user.click(button)
                await user.click(button)
            }

            await waitFor(() => {
                expect(screen.getByText(/A Duʿāʾ for You/i)).toBeInTheDocument()
            })
        })
    })

    describe('Accessibility', () => {
        test('has proper ARIA labels for buttons', async () => {
            render(<AzkarPage />)

            await waitFor(() => {
                const resetButton = screen.getByTitle(/Reset this dhikr/i)
                expect(resetButton).toBeInTheDocument()
            })
        })

        test('supports keyboard navigation', async () => {
            const user = userEvent.setup()
            render(<AzkarPage />)

            await waitFor(() => {
                const countButton = screen.getByText(/Count/i)
                expect(countButton).toBeInTheDocument()
            })

            const countButton = screen.getByText(/Count/i)
            await user.tab()
            expect(countButton).toHaveFocus()
        })
    })

    describe('Error Handling', () => {
        test('handles API errors gracefully', async () => {
            const mockFetchAzkar = require('@/utils/api').fetchAzkar
            mockFetchAzkar.mockRejectedValueOnce(new Error('API Error'))

            render(<AzkarPage />)

            await waitFor(() => {
                expect(screen.getByText(/Error loading azkar/i)).toBeInTheDocument()
            })
        })
    })

    describe('Responsive Design', () => {
        test('adapts to different screen sizes', () => {
            render(<AzkarPage />)

            const container = screen.getByTestId('azkar-container')
            expect(container).toHaveClass('max-w-4xl')
        })
    })
})

