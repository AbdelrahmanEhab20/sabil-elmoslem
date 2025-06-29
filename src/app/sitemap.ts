import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://islamic-site.com'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
            alternates: {
                languages: {
                    'ar': `${baseUrl}/ar`,
                    'en': `${baseUrl}/en`,
                },
            },
        },
        {
            url: `${baseUrl}/prayer-times`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
            alternates: {
                languages: {
                    'ar': `${baseUrl}/ar/prayer-times`,
                    'en': `${baseUrl}/en/prayer-times`,
                },
            },
        },
        {
            url: `${baseUrl}/azkar`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
                languages: {
                    'ar': `${baseUrl}/ar/azkar`,
                    'en': `${baseUrl}/en/azkar`,
                },
            },
        },
        {
            url: `${baseUrl}/quran`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
                languages: {
                    'ar': `${baseUrl}/ar/quran`,
                    'en': `${baseUrl}/en/quran`,
                },
            },
        },
    ]
} 