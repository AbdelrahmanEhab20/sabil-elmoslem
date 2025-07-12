export interface Translations {
    // Navigation
    home: string;
    prayerTimes: string;
    azkar: string;
    quran: string;
    islamicSite: string;

    // Theme
    lightMode: string;
    darkMode: string;

    // Language
    english: string;
    arabic: string;

    // Home Page
    welcome: string;
    welcomeSubtitle: string;
    bismillah: string;
    bismillahTranslation: string;
    quickAccess: string;
    whatWeOffer: string;
    whatWeOfferSubtitle: string;
    startJourney: string;
    startJourneySubtitle: string;
    viewPrayerTimes: string;
    readAzkar: string;

    // Features
    prayerTimesTitle: string;
    prayerTimesDescription: string;
    azkarTitle: string;
    azkarDescription: string;
    quranTitle: string;
    quranDescription: string;

    // Feature Details
    accuratePrayerTimes: string;
    accuratePrayerTimesDesc: string;
    dailyAzkar: string;
    dailyAzkarDesc: string;
    quranReader: string;
    quranReaderDesc: string;
    tajweedRules: string;
    showTajweed: string;
    hideTajweed: string;
    tajweedRulesUsed: string;
    tajweedDescription: string;
    tajweedToggle: string;
    tajweedLegend: string;
    tajweedExamples: string;
    tajweedColorCode: string;

    // Prayer Times
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    imsak: string;
    midnight: string;
    firstThird: string;
    lastThird: string;
    nextPrayer: string;
    timeRemaining: string;
    location: string;
    setLocation: string;
    calculationMethod: string;
    madhab: string;

    // Common
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    close: string;
    search: string;
    noResults: string;

    // Add these to both 'en' and 'ar' objects:
    about: string;
    quickLinks: string;
    information: string;
    prayerTimesApiInfo: string;
    quranApiInfo: string;
    openSourceInfo: string;
    madeWithLove: string;
    errorLoadingAzkar: string;
    errorLoadingQuran: string;
    errorFetchingPrayerTimes: string;
    errorGettingLocation: string;
    cityNotFound: string;
    locationSet: string;
    tipsForReadingAzkar: string;
    readWithSincerityAndFocusOnTheMeaning: string;
    tryToUnderstandTheArabicTextAndItsTranslation: string;
    maintainConsistencyInYourDailyPractice: string;
    useTheCounterToTrackYourProgress: string;
    readAtTheRecommendedTimesMorningEvening: string;
    noAzkarFound: string;
    trySelectingDifferentCategoryOrCheckBackLater: string;
    noSurahsFound: string;
    tryAdjustingSearch: string;
}

export const translations: Record<'en' | 'ar', Translations> = {
    en: {
        // Navigation
        home: 'Home',
        prayerTimes: 'Prayer Times',
        azkar: 'Azkar',
        quran: 'Quran',
        islamicSite: 'Sabil Elmoslem',

        // Theme
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',

        // Language
        english: 'English',
        arabic: 'العربية',

        // Home Page
        welcome: 'Welcome to Sabil Elmoslem',
        welcomeSubtitle: 'Your comprehensive Islamic platform for prayer times, daily azkar, and Quran reading. May Allah guide us all.',
        bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        bismillahTranslation: 'In the name of Allah, the Most Gracious, the Most Merciful',
        quickAccess: 'Quick Access',
        whatWeOffer: 'What We Offer',
        whatWeOfferSubtitle: 'Everything you need for your daily Islamic practices in one place',
        startJourney: 'Start Your Journey Today',
        startJourneySubtitle: 'Begin with prayer times or explore our comprehensive Islamic resources',
        viewPrayerTimes: 'View Prayer Times',
        readAzkar: 'Read Azkar',

        // Features
        prayerTimesTitle: 'Prayer Times',
        prayerTimesDescription: 'Get accurate prayer times for your location',
        azkarTitle: 'Daily Azkar',
        azkarDescription: 'Morning and evening supplications',
        quranTitle: 'Quran Reader',
        quranDescription: 'Read Quran with Tajweed and translations',

        // Feature Details
        accuratePrayerTimes: 'Accurate Prayer Times',
        accuratePrayerTimesDesc: 'Get precise prayer times based on your location using reliable calculation methods.',
        dailyAzkar: 'Daily Azkar',
        dailyAzkarDesc: 'Access morning and evening supplications with translations and references.',
        quranReader: 'Quran Reader',
        quranReaderDesc: 'Read the complete Quran with Tajweed markings and multiple translations.',
        tajweedRules: 'Tajweed Rules',
        showTajweed: 'Show Tajweed',
        hideTajweed: 'Hide Tajweed',
        tajweedRulesUsed: 'Tajweed rules used:',
        tajweedDescription: 'Read and reflect upon the words of Allah with Tajweed rules',
        tajweedToggle: 'Toggle Tajweed Display',
        tajweedLegend: 'Tajweed Legend',
        tajweedExamples: 'Examples',
        tajweedColorCode: 'Color Code',

        // Prayer Times
        fajr: 'Fajr',
        sunrise: 'Sunrise',
        dhuhr: 'Dhuhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha',
        imsak: 'Imsak',
        midnight: 'Midnight',
        firstThird: 'First Third',
        lastThird: 'Last Third',
        nextPrayer: 'Next Prayer',
        timeRemaining: 'Time Remaining',
        location: 'Location',
        setLocation: 'Set Location',
        calculationMethod: 'Calculation Method',
        madhab: 'Madhab',

        // Common
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        search: 'Search',
        noResults: 'No results found',

        // Add these to both 'en' and 'ar' objects:
        about: 'About',
        quickLinks: 'Quick Links',
        information: 'Information',
        prayerTimesApiInfo: 'Prayer times calculated using Aladhan API',
        quranApiInfo: 'Quran text from AlQuran Cloud API',
        openSourceInfo: 'Free and open source project',
        madeWithLove: 'Made with ❤️ for the Ummah.',
        errorLoadingAzkar: 'Failed to load Azkar. Please try again.',
        errorLoadingQuran: 'Failed to load Quran data. Please try again.',
        errorFetchingPrayerTimes: 'Failed to fetch prayer times. Please try again.',
        errorGettingLocation: 'Unable to get your location. Please allow location access or search for a city.',
        cityNotFound: 'City not found. Please try again.',
        locationSet: 'Location set successfully!',
        tipsForReadingAzkar: 'Tips for Reading Azkar',
        readWithSincerityAndFocusOnTheMeaning: 'Read with sincerity and focus on the meaning',
        tryToUnderstandTheArabicTextAndItsTranslation: 'Try to understand the Arabic text and its translation',
        maintainConsistencyInYourDailyPractice: 'Maintain consistency in your daily practice',
        useTheCounterToTrackYourProgress: 'Use the counter to track your progress',
        readAtTheRecommendedTimesMorningEvening: 'Read at the recommended times (morning/evening)',
        noAzkarFound: 'No Azkar Found',
        trySelectingDifferentCategoryOrCheckBackLater: 'Try selecting a different category or check back later.',
        noSurahsFound: 'No Surahs Found',
        tryAdjustingSearch: 'Try adjusting your search terms.',
    },
    ar: {
        // Navigation
        home: 'الرئيسية',
        prayerTimes: 'أوقات الصلاة',
        azkar: 'الأذكار',
        quran: 'القرآن',
        islamicSite: 'سبيل المسلم',

        // Theme
        lightMode: 'الوضع النهاري',
        darkMode: 'الوضع الليلي',

        // Language
        english: 'English',
        arabic: 'العربية',

        // Home Page
        welcome: 'مرحباً بكم في سبيل المسلم',
        welcomeSubtitle: 'منصتكم الإسلامية الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن. نسأل الله أن يهدينا جميعاً.',
        bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        bismillahTranslation: 'باسم الله الرحمن الرحيم',
        quickAccess: 'الوصول السريع',
        whatWeOffer: 'ما نقدمه',
        whatWeOfferSubtitle: 'كل ما تحتاجه لممارساتك الإسلامية اليومية في مكان واحد',
        startJourney: 'ابدأ رحلتك اليوم',
        startJourneySubtitle: 'ابدأ بأوقات الصلاة أو استكشف مواردنا الإسلامية الشاملة',
        viewPrayerTimes: 'عرض أوقات الصلاة',
        readAzkar: 'قراءة الأذكار',

        // Features
        prayerTimesTitle: 'أوقات الصلاة',
        prayerTimesDescription: 'احصل على أوقات صلاة دقيقة لموقعك',
        azkarTitle: 'الأذكار اليومية',
        azkarDescription: 'أذكار الصباح والمساء',
        quranTitle: 'قارئ القرآن',
        quranDescription: 'اقرأ القرآن بالتجويد والترجمات',

        // Feature Details
        accuratePrayerTimes: 'أوقات صلاة دقيقة',
        accuratePrayerTimesDesc: 'احصل على أوقات صلاة دقيقة بناءً على موقعك باستخدام طرق حساب موثوقة.',
        dailyAzkar: 'الأذكار اليومية',
        dailyAzkarDesc: 'الوصول إلى أذكار الصباح والمساء مع الترجمات والمراجع.',
        quranReader: 'قارئ القرآن',
        quranReaderDesc: 'اقرأ القرآن الكريم كاملاً مع علامات التجويد وترجمات متعددة.',
        tajweedRules: 'قواعد التجويد',
        showTajweed: 'إظهار التجويد',
        hideTajweed: 'إخفاء التجويد',
        tajweedRulesUsed: 'قواعد التجويد المستخدمة:',
        tajweedDescription: 'اقرأ وتأمل في كلام الله مع قواعد التجويد',
        tajweedToggle: 'تبديل عرض التجويد',
        tajweedLegend: 'دليل التجويد',
        tajweedExamples: 'أمثلة',
        tajweedColorCode: 'رمز اللون',

        // Prayer Times
        fajr: 'الفجر',
        sunrise: 'الشروق',
        dhuhr: 'الظهر',
        asr: 'العصر',
        maghrib: 'المغرب',
        isha: 'العشاء',
        imsak: 'الإمساك',
        midnight: 'منتصف الليل',
        firstThird: 'الثلث الأول',
        lastThird: 'الثلث الأخير',
        nextPrayer: 'الصلاة القادمة',
        timeRemaining: 'الوقت المتبقي',
        location: 'الموقع',
        setLocation: 'تحديد الموقع',
        calculationMethod: 'طريقة الحساب',
        madhab: 'المذهب',

        // Common
        loading: 'جاري التحميل...',
        error: 'خطأ',
        retry: 'إعادة المحاولة',
        save: 'حفظ',
        cancel: 'إلغاء',
        close: 'إغلاق',
        search: 'بحث',
        noResults: 'لا توجد نتائج',

        // Add these to both 'en' and 'ar' objects:
        about: 'حول',
        quickLinks: 'روابط سريعة',
        information: 'معلومات',
        prayerTimesApiInfo: 'أوقات الصلاة محسوبة باستخدام واجهة Aladhan API',
        quranApiInfo: 'نص القرآن من AlQuran Cloud API',
        openSourceInfo: 'مشروع مجاني ومفتوح المصدر',
        madeWithLove: 'صنع بحب ❤️ للأمة.',
        errorLoadingAzkar: 'تعذر تحميل الأذكار. يرجى المحاولة مرة أخرى.',
        errorLoadingQuran: 'تعذر تحميل بيانات القرآن. يرجى المحاولة مرة أخرى.',
        errorFetchingPrayerTimes: 'تعذر جلب أوقات الصلاة. يرجى المحاولة مرة أخرى.',
        errorGettingLocation: 'تعذر الحصول على موقعك. يرجى السماح بالوصول إلى الموقع أو البحث عن مدينة.',
        cityNotFound: 'لم يتم العثور على المدينة. يرجى المحاولة مرة أخرى.',
        locationSet: 'تم تعيين الموقع بنجاح!',
        tipsForReadingAzkar: 'نصائح لقراءة الأذكار',
        readWithSincerityAndFocusOnTheMeaning: 'اقرأ بإخلاص وركز على المعنى',
        tryToUnderstandTheArabicTextAndItsTranslation: 'حاول فهم النص العربي وترجمته',
        maintainConsistencyInYourDailyPractice: 'حافظ على الاستمرارية في ممارستك اليومية',
        useTheCounterToTrackYourProgress: 'استخدم العداد لتتبع تقدمك',
        readAtTheRecommendedTimesMorningEvening: 'اقرأ في الأوقات الموصى بها (الصباح/المساء)',
        noAzkarFound: 'لم يتم العثور على أذكار',
        trySelectingDifferentCategoryOrCheckBackLater: 'حاول اختيار فئة مختلفة أو تحقق لاحقًا.',
        noSurahsFound: 'لم يتم العثور على سور',
        tryAdjustingSearch: 'حاول تعديل مصطلحات البحث.',
    }
};

export const useTranslations = (language: 'en' | 'ar') => {
    // Fallback to English if language is not supported
    const supportedLanguage = ['en', 'ar'].includes(language) ? language : 'en';
    return translations[supportedLanguage];
}; 