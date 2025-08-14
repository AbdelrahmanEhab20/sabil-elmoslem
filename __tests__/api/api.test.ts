/**
 * API Functions Tests
 * 
 * Why we test this:
 * - API functions are critical for data fetching and processing
 * - DST adjustment logic is complex and must be accurate for prayer times
 * - Error handling ensures app stability
 * - Caching logic affects performance and user experience
 * - Location-based functionality needs to work correctly
 */

import { fetchPrayerTimes, fetchQuranSurahs, fetchAzkar, getCurrentLocation, searchCityCoordinates } from '@/utils/api'

// Mock fetch globally
global.fetch = jest.fn()

// Mock console methods to avoid noise in tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

beforeAll(() => {
    console.warn = jest.fn()
    console.error = jest.fn()
})

afterAll(() => {
    console.warn = originalConsoleWarn
    console.error = originalConsoleError
})

describe('API Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (global.fetch as jest.Mock).mockClear()
    })

    describe('fetchPrayerTimes', () => {
        const mockLocation = { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' }
        const mockPrayerTimes = {
            Fajr: '03:29',
            Sunrise: '05:15',
            Dhuhr: '12:00',
            Asr: '15:30',
            Maghrib: '18:45',
            Isha: '20:15',
            Imsak: '03:19',
            Midnight: '23:30',
            Firstthird: '21:30',
            Lastthird: '01:30'
        }

        test('fetches prayer times successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        timings: mockPrayerTimes
                    }
                })
            })

            const result = await fetchPrayerTimes(mockLocation)

            expect(result).toEqual(mockPrayerTimes)
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('api.aladhan.com/v1/timings')
            )
        })

        test('applies DST adjustment for Egypt during summer time', async () => {
            // Mock current date to be in summer (July)
            const originalDate = global.Date
            global.Date = class extends Date {
                constructor() {
                    super('2024-07-15T10:00:00Z')
                }
                getMonth() {
                    return 6 // July (0-indexed)
                }
            } as any

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            timings: mockPrayerTimes
                        }
                    })
                })

            const result = await fetchPrayerTimes(mockLocation)

            // Times should be adjusted +1 hour for DST
            expect(result.Fajr).toBe('04:29') // 03:29 + 1 hour
            expect(result.Sunrise).toBe('06:15') // 05:15 + 1 hour
            expect(result.Dhuhr).toBe('13:00') // 12:00 + 1 hour

            // Restore original Date
            global.Date = originalDate
        })

        test('does not apply DST adjustment during winter time', async () => {
            // Mock current date to be in winter (January)
            const originalDate = global.Date
            global.Date = class extends Date {
                constructor() {
                    super('2024-01-15T10:00:00Z')
                }
                getMonth() {
                    return 0 // January (0-indexed)
                }
            } as any

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            timings: mockPrayerTimes
                        }
                    })
                })

            const result = await fetchPrayerTimes(mockLocation)

            // Times should remain unchanged
            expect(result.Fajr).toBe('03:29')
            expect(result.Sunrise).toBe('05:15')
            expect(result.Dhuhr).toBe('12:00')

            // Restore original Date
            global.Date = originalDate
        })

        test('does not apply DST adjustment for non-Egypt locations', async () => {
            const nonEgyptLocation = { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA' }

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            timings: mockPrayerTimes
                        }
                    })
                })

            const result = await fetchPrayerTimes(nonEgyptLocation)

            // Times should remain unchanged for non-Egypt locations
            expect(result.Fajr).toBe('03:29')
            expect(result.Sunrise).toBe('05:15')
        })

        test('handles API errors gracefully', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

            await expect(fetchPrayerTimes(mockLocation)).rejects.toThrow('Network error')
        })

        test('handles invalid API response', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: null // Invalid response
                })
            })

            await expect(fetchPrayerTimes(mockLocation)).rejects.toThrow('Invalid prayer times data received')
        })

        test('caches results for 5 minutes', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        timings: mockPrayerTimes
                    }
                })
            })

            // First call
            await fetchPrayerTimes(mockLocation)
            expect(global.fetch).toHaveBeenCalledTimes(1)

            // Second call should use cache
            await fetchPrayerTimes(mockLocation)
            expect(global.fetch).toHaveBeenCalledTimes(1) // Still 1, not 2
        })
    })

    describe('fetchQuranSurahs', () => {
        const mockSurahs = [
            {
                number: 1,
                name: 'الفاتحة',
                englishName: 'Al-Fatiha',
                englishNameTranslation: 'The Opening',
                numberOfAyahs: 7,
                revelationType: 'Meccan'
            }
        ]

        test('fetches Quran surahs successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: mockSurahs
                })
            })

            const result = await fetchQuranSurahs()

            expect(result).toEqual(mockSurahs)
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('api.alquran.cloud/v1/surah')
            )
        })

        test('handles API errors gracefully', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

            await expect(fetchQuranSurahs()).rejects.toThrow('Network error')
        })

        test('caches results for 24 hours', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: mockSurahs
                })
            })

            // First call
            await fetchQuranSurahs()
            expect(global.fetch).toHaveBeenCalledTimes(1)

            // Second call should use cache
            await fetchQuranSurahs()
            expect(global.fetch).toHaveBeenCalledTimes(1) // Still 1, not 2
        })
    })

    describe('fetchAzkar', () => {
        const mockAzkar = [
            {
                id: 1,
                category: 'Morning Adhkar',
                count: '3',
                description: 'Test dhikr',
                reference: 'Bukhari',
                content: 'سبحان الله'
            }
        ]

        test('fetches azkar successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockAzkar
            })

            const result = await fetchAzkar('en')

            expect(result).toEqual(mockAzkar)
        })

        test('handles different languages', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockAzkar
            })

            await fetchAzkar('ar')

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/azkar-ar.json')
            )
        })

        test('handles API errors gracefully', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

            await expect(fetchAzkar('en')).rejects.toThrow('Network error')
        })
    })

    describe('getCurrentLocation', () => {
        test('gets current location successfully', async () => {
            const mockGeolocation = {
                getCurrentPosition: jest.fn().mockImplementation((success) =>
                    success({
                        coords: {
                            latitude: 30.0444,
                            longitude: 31.2357
                        }
                    })
                )
            }
            global.navigator.geolocation = mockGeolocation

            const result = await getCurrentLocation()

            expect(result).toEqual({
                latitude: 30.0444,
                longitude: 31.2357
            })
        })

        test('handles geolocation errors', async () => {
            const mockGeolocation = {
                getCurrentPosition: jest.fn().mockImplementation((success, error) =>
                    error(new Error('Geolocation error'))
                )
            }
            global.navigator.geolocation = mockGeolocation

            await expect(getCurrentLocation()).rejects.toThrow('Geolocation error')
        })

        test('handles geolocation not supported', async () => {
            global.navigator.geolocation = undefined

            await expect(getCurrentLocation()).rejects.toThrow('Geolocation is not supported')
        })
    })

    describe('searchCityCoordinates', () => {
        const mockCityData = [
            {
                name: 'Cairo',
                country: 'EG',
                lat: 30.0444,
                lon: 31.2357
            }
        ]

        test('searches city coordinates successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCityData
            })

            const result = await searchCityCoordinates('Cairo', 'en')

            expect(result).toEqual({
                latitude: 30.0444,
                longitude: 31.2357,
                city: 'Cairo',
                country: 'EG'
            })
        })

        test('handles city not found', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => []
            })

            await expect(searchCityCoordinates('NonexistentCity', 'en')).rejects.toThrow('City not found')
        })

        test('handles API errors', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

            await expect(searchCityCoordinates('Cairo', 'en')).rejects.toThrow('Network error')
        })

        test('validates input parameters', async () => {
            await expect(searchCityCoordinates('', 'en')).rejects.toThrow('City name is required')
        })
    })

    describe('Error Handling and Retry Logic', () => {
        test('retries failed requests', async () => {
            ; (global.fetch as jest.Mock)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            timings: { Fajr: '03:29' }
                        }
                    })
                })

            const result = await fetchPrayerTimes({ latitude: 30.0444, longitude: 31.2357 })

            expect(global.fetch).toHaveBeenCalledTimes(2)
            expect(result.Fajr).toBe('03:29')
        })

        test('handles timeout errors', async () => {
            ; (global.fetch as jest.Mock).mockImplementation(() =>
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 100)
                )
            )

            await expect(fetchPrayerTimes({ latitude: 30.0444, longitude: 31.2357 })).rejects.toThrow('Timeout')
        })
    })
})

