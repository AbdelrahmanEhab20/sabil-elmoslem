/**
 * Load Testing Script for Islamic App
 *
 * Why we need load testing:
 * - Prayer times are accessed frequently (5 times daily by Muslims)
 * - Quran reading is a core feature that needs to handle concurrent users
 * - Azkar functionality should work smoothly during peak usage times
 * - API endpoints must handle traffic spikes during Ramadan and other Islamic events
 * - Mobile users expect fast response times
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");

// Test configuration
export const options = {
  // Test scenarios
  scenarios: {
    // Normal traffic simulation
    normal_traffic: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "2m", target: 50 }, // Ramp up to 50 users
        { duration: "5m", target: 50 }, // Stay at 50 users
        { duration: "2m", target: 0 }, // Ramp down
      ],
      gracefulRampDown: "30s",
    },

    // Peak traffic simulation (e.g., during prayer times)
    peak_traffic: {
      executor: "ramping-vus",
      startVUs: 20,
      stages: [
        { duration: "1m", target: 100 }, // Quick ramp up
        { duration: "3m", target: 100 }, // Peak load
        { duration: "1m", target: 0 }, // Ramp down
      ],
      gracefulRampDown: "30s",
    },

    // Stress testing
    stress_test: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "2m", target: 50 }, // Ramp up
        { duration: "5m", target: 100 }, // Increase load
        { duration: "2m", target: 200 }, // Stress test
        { duration: "2m", target: 0 }, // Ramp down
      ],
      gracefulRampDown: "30s",
    },
  },

  // Thresholds for performance requirements
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2 seconds
    http_req_failed: ["rate<0.1"], // Less than 10% error rate
    http_req_rate: ["rate>100"], // At least 100 requests per second
  },
};

// Test data
const testData = {
  locations: [
    { lat: 30.0444, lon: 31.2357, city: "Cairo" }, // Egypt
    { lat: 21.4225, lon: 39.8262, city: "Mecca" }, // Saudi Arabia
    { lat: 24.7136, lon: 46.6753, city: "Riyadh" }, // Saudi Arabia
    { lat: 25.2048, lon: 55.2708, city: "Dubai" }, // UAE
    { lat: 40.7128, lon: -74.006, city: "New York" }, // USA
  ],
  surahs: [1, 2, 36, 55, 67, 112, 113, 114], // Popular surahs
};

// Helper function to get random location
function getRandomLocation() {
  return testData.locations[
    Math.floor(Math.random() * testData.locations.length)
  ];
}

// Helper function to get random surah
function getRandomSurah() {
  return testData.surahs[Math.floor(Math.random() * testData.surahs.length)];
}

// Main test function
export default function () {
  const baseUrl = __ENV.BASE_URL || "https://your-domain.com";
  const location = getRandomLocation();

  // Test 1: Home page
  const homeResponse = http.get(`${baseUrl}/`);
  check(homeResponse, {
    "home page loads successfully": (r) => r.status === 200,
    "home page loads fast": (r) => r.timings.duration < 2000,
  });

  // Test 2: Prayer times API
  const prayerTimesResponse = http.get(
    `${baseUrl}/api/prayer-times?latitude=${location.lat}&longitude=${location.lon}&method=1&madhab=1`
  );
  check(prayerTimesResponse, {
    "prayer times API responds": (r) => r.status === 200,
    "prayer times API is fast": (r) => r.timings.duration < 1500,
    "prayer times data is valid": (r) => {
      const data = JSON.parse(r.body);
      return data.Fajr && data.Dhuhr && data.Maghrib;
    },
  });

  // Test 3: Prayer times page
  const prayerTimesPageResponse = http.get(`${baseUrl}/prayer-times`);
  check(prayerTimesPageResponse, {
    "prayer times page loads": (r) => r.status === 200,
    "prayer times page is responsive": (r) => r.timings.duration < 3000,
  });

  // Test 4: Quran surahs API
  const surahsResponse = http.get(`${baseUrl}/api/quran/surahs`);
  check(surahsResponse, {
    "Quran surahs API responds": (r) => r.status === 200,
    "Quran surahs data is valid": (r) => {
      const data = JSON.parse(r.body);
      return Array.isArray(data) && data.length > 0;
    },
  });

  // Test 5: Quran page
  const quranPageResponse = http.get(`${baseUrl}/quran`);
  check(quranPageResponse, {
    "Quran page loads": (r) => r.status === 200,
    "Quran page is responsive": (r) => r.timings.duration < 3000,
  });

  // Test 6: Specific surah (popular ones)
  const surahNumber = getRandomSurah();
  const surahResponse = http.get(`${baseUrl}/api/quran/surah/${surahNumber}`);
  check(surahResponse, {
    "surah API responds": (r) => r.status === 200,
    "surah data is valid": (r) => {
      const data = JSON.parse(r.body);
      return data.number === surahNumber && data.ayahs;
    },
  });

  // Test 7: Azkar API
  const azkarResponse = http.get(`${baseUrl}/api/azkar?language=en`);
  check(azkarResponse, {
    "azkar API responds": (r) => r.status === 200,
    "azkar data is valid": (r) => {
      const data = JSON.parse(r.body);
      return Array.isArray(data) && data.length > 0;
    },
  });

  // Test 8: Azkar page
  const azkarPageResponse = http.get(`${baseUrl}/azkar`);
  check(azkarPageResponse, {
    "azkar page loads": (r) => r.status === 200,
    "azkar page is responsive": (r) => r.timings.duration < 3000,
  });

  // Test 9: City search API
  const citySearchResponse = http.get(
    `${baseUrl}/api/geocoding/search?q=${location.city}&limit=1`
  );
  check(citySearchResponse, {
    "city search API responds": (r) => r.status === 200,
    "city search returns results": (r) => {
      const data = JSON.parse(r.body);
      return Array.isArray(data) && data.length > 0;
    },
  });

  // Test 10: Static assets (CSS, JS, images)
  const staticAssets = [
    "/favicon.ico",
    "/images/logo.png",
    "/images/whiteIslamicIcon.png",
  ];

  staticAssets.forEach((asset) => {
    const assetResponse = http.get(`${baseUrl}${asset}`);
    check(assetResponse, {
      [`${asset} loads`]: (r) => r.status === 200,
      [`${asset} is fast`]: (r) => r.timings.duration < 1000,
    });
  });

  // Error tracking
  errorRate.add(
    homeResponse.status !== 200 ||
      prayerTimesResponse.status !== 200 ||
      prayerTimesPageResponse.status !== 200 ||
      surahsResponse.status !== 200 ||
      quranPageResponse.status !== 200 ||
      surahResponse.status !== 200 ||
      azkarResponse.status !== 200 ||
      azkarPageResponse.status !== 200
  );

  // Think time between requests (simulate real user behavior)
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Setup function (runs once before the test)
export function setup() {
  console.log("Starting load test for Islamic App");
  console.log(`Base URL: ${__ENV.BASE_URL || "https://your-domain.com"}`);
  console.log("Test scenarios: Normal traffic, Peak traffic, Stress test");
}

// Teardown function (runs once after the test)
export function teardown(data) {
  console.log("Load test completed");
  console.log("Check the results for performance insights");
}

