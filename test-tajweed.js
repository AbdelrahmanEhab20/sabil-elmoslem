// Simple test script for Tajweed processor
// This will help us verify that the new rules are being applied correctly

const testAyahs = [
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", // Al-Fatiha:1 - Should have various rules
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", // Al-Fatiha:2 - Should have Lam Shamsiyyah
  "مِنْ نُّطْفَةٍ", // Example with Idgham
  "مِنْ بَعْدِ", // Example with Iqlab
  "مِنْ فَضْلِهِ", // Example with Ikhfa
  "مِنْ مَّاءٍ", // Example with Idgham Shafawi
  "مِنْ بَيْنِ", // Example with Iqlab
  "قُلْ هُوَ اللَّهُ أَحَدٌ", // Al-Ikhlas:1 - Should have Qalaqah
];

console.log("Testing Tajweed Processor with new rules...");
console.log("Test ayahs:", testAyahs);

// This would be used in the browser console to test
// You can copy these ayahs and test them in the Quran page
