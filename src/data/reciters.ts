// Quran Reciters Data - Using EveryAyah.com CDN
// https://everyayah.com/data/{folder}/{surah_padded}{ayah_padded}.mp3

export interface Reciter {
    id: number;
    name: string;
    nameAr: string;
    folder: string;
}

export const QURAN_RECITERS: Reciter[] = [
    // Most Popular
    { id: 1, name: 'Mishary Rashid Alafasy', nameAr: 'مشاري راشد العفاسي', folder: 'Alafasy_128kbps' },
    { id: 2, name: 'Abdul Basit (Murattal)', nameAr: 'عبد الباسط عبد الصمد (مرتل)', folder: 'Abdul_Basit_Murattal_192kbps' },
    { id: 3, name: 'Abdul Basit (Mujawwad)', nameAr: 'عبد الباسط عبد الصمد (مجود)', folder: 'Abdul_Basit_Mujawwad_128kbps' },
    { id: 4, name: 'Abdul Rahman Al-Sudais', nameAr: 'عبد الرحمن السديس', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
    { id: 5, name: 'Saud Al-Shuraim', nameAr: 'سعود الشريم', folder: 'Saood_ash-Shuraym_128kbps' },
    
    // Egyptian Reciters
    { id: 6, name: 'Mahmoud Khalil Al-Husary', nameAr: 'محمود خليل الحصري', folder: 'Husary_128kbps' },
    { id: 7, name: 'Al-Husary (Muallim)', nameAr: 'الحصري (معلم)', folder: 'Husary_Muallim_128kbps' },
    { id: 8, name: 'Muhammad Siddiq Al-Minshawi', nameAr: 'محمد صديق المنشاوي', folder: 'Minshawy_Murattal_128kbps' },
    { id: 9, name: 'Al-Minshawi (Mujawwad)', nameAr: 'المنشاوي (مجود)', folder: 'Minshawy_Mujawwad_192kbps' },
    { id: 10, name: 'Muhammad Jibreel', nameAr: 'محمد جبريل', folder: 'Muhammad_Jibreel_128kbps' },
    
    // Saudi Reciters
    { id: 11, name: 'Maher Al-Muaiqly', nameAr: 'ماهر المعيقلي', folder: 'MasharMaiqli128kbps' },
    { id: 12, name: 'Saad Al-Ghamdi', nameAr: 'سعد الغامدي', folder: 'Ghamadi_40kbps' },
    { id: 13, name: 'Abu Bakr Al-Shatri', nameAr: 'أبو بكر الشاطري', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' },
    { id: 14, name: 'Yasser Al-Dosari', nameAr: 'ياسر الدوسري', folder: 'Yasser_Ad-Dussary_128kbps' },
    { id: 15, name: 'Nasser Al-Qatami', nameAr: 'ناصر القطامي', folder: 'Nasser_Alqatami_128kbps' },
    { id: 16, name: 'Abdullah Basfar', nameAr: 'عبد الله بصفر', folder: 'Abdullah_Basfar_192kbps' },
    { id: 17, name: 'Ali Al-Hudhaify', nameAr: 'علي الحذيفي', folder: 'Hudhaify_128kbps' },
    { id: 18, name: 'Muhammad Ayyub', nameAr: 'محمد أيوب', folder: 'Muhammad_Ayyoub_128kbps' },
    { id: 19, name: 'Khalid Al-Qahtani', nameAr: 'خالد القحطاني', folder: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps' },
    
    // Other Popular Reciters
    { id: 20, name: 'Hani Ar-Rifai', nameAr: 'هاني الرفاعي', folder: 'Hani_Rifai_192kbps' },
    { id: 21, name: 'Ahmed Al-Ajmi', nameAr: 'أحمد العجمي', folder: 'ahmed_ibn_ali_al_ajamy_128kbps' },
    { id: 22, name: 'Ibrahim Al-Akhdar', nameAr: 'إبراهيم الأخضر', folder: 'Ibrahim_Akhdar_32kbps' },
    { id: 23, name: 'Fares Abbad', nameAr: 'فارس عباد', folder: 'Fares_Abbad_64kbps' },
    { id: 24, name: 'Abdulbari Al-Thubaity', nameAr: 'عبد الباري الثبيتي', folder: 'AbdulSamad_64kbps_QuranExplorer.Com' },
    { id: 25, name: 'Salah Bukhatir', nameAr: 'صلاح بو خاطر', folder: 'Salah_Bukhatir_128kbps' },
];

// Audio CDN base URL
export const AUDIO_CDN_BASE = 'https://everyayah.com/data';

// Helper to get audio URL for a specific ayah
export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciterId: number = 1): string {
    const reciter = QURAN_RECITERS.find(r => r.id === reciterId) || QURAN_RECITERS[0];
    const surah = surahNumber.toString().padStart(3, '0');
    const ayah = ayahNumber.toString().padStart(3, '0');
    return `${AUDIO_CDN_BASE}/${reciter.folder}/${surah}${ayah}.mp3`;
}

// Get reciter by ID
export function getReciterById(id: number): Reciter | undefined {
    return QURAN_RECITERS.find(r => r.id === id);
}

// Get default reciter
export function getDefaultReciter(): Reciter {
    return QURAN_RECITERS[0];
}

