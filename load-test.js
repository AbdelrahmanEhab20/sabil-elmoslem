import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users over 30 seconds
    { duration: '1m', target: 10 },  // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test home page
  let homeResponse = http.get(`${BASE_URL}/`);
  check(homeResponse, {
    'home page loads': (r) => r.status === 200,
    'home page has content': (r) => r.body.includes('سبيل المسلم'),
  });

  sleep(1);

  // Test prayer times page
  let prayerResponse = http.get(`${BASE_URL}/prayer-times`);
  check(prayerResponse, {
    'prayer times page loads': (r) => r.status === 200,
    'prayer times page has content': (r) => r.body.includes('أوقات الصلاة'),
  });

  sleep(1);

  // Test Quran page
  let quranResponse = http.get(`${BASE_URL}/quran`);
  check(quranResponse, {
    'quran page loads': (r) => r.status === 200,
    'quran page has content': (r) => r.body.includes('القرآن'),
  });

  sleep(1);

  // Test Azkar page
  let azkarResponse = http.get(`${BASE_URL}/azkar`);
  check(azkarResponse, {
    'azkar page loads': (r) => r.status === 200,
    'azkar page has content': (r) => r.body.includes('الأذكار'),
  });

  sleep(1);
}