# Islamic Site - Prayer Times, Azkar & Quran

A comprehensive Islamic web platform providing prayer times, daily azkar (supplications), and Quran reading with a beautiful, modern UI.

## 🌐 Live Demo

**Visit the live site:** [https://islamic-site-lemon.vercel.app/](https://islamic-site-lemon.vercel.app/)

## 🌟 Features

### 🕌 Prayer Times
- **Location-based prayer times** using the Aladhan API
- **Real-time updates** with current time and next prayer countdown
- **Manual city search** or automatic geolocation
- **Multiple calculation methods** and madhabs
- **Beautiful visual display** with prayer time cards

### 📿 Daily Azkar
- **Categorized supplications** (Morning, Evening, After Prayer, Tasbeeh, Quranic Duas, Prophets' Duas)
- **Interactive counters** for tracking progress
- **Arabic text with English translations**
- **Reference citations** from authentic sources
- **Progress indicators** and completion tracking
- **Bilingual support** (Arabic and English)

### 📖 Quran Reader
- **Complete Quran** with all 114 surahs
- **Search functionality** by name, translation, or number
- **Ayah-by-ayah display** with proper Arabic formatting
- **Sajda verse indicators** and detailed metadata
- **Responsive design** for all devices
- **Surah navigation sidebar**

### 🎨 User Experience
- **Dark/Light theme** toggle
- **Bilingual interface** (Arabic/English)
- **Responsive design** for mobile and desktop
- **Fast loading** with optimized performance
- **Accessible design** with proper contrast and navigation
- **Local storage** for user preferences

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Context API
- **APIs**: 
  - Aladhan API (Prayer Times)
  - AlQuran Cloud API (Quran)
  - OpenWeatherMap API (City Search)
  - Static JSON (Azkar)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd islamic-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 APIs Used

### Prayer Times
- **Aladhan API**: Free prayer times calculation
- **Geolocation**: Browser-based location detection
- **City Search**: OpenWeatherMap Geocoding API

### Quran
- **AlQuran Cloud API**: Complete Quran text and metadata
- **Features**: Surah list, ayah details, revelation types

### Azkar
- **Static Data**: Curated collection of authentic supplications
- **Categories**: Morning Adhkar, Evening Adhkar, Post-Prayer Azkar, Tasbeeh, Azkar Before Sleep, Azkar Upon Waking, Quranic Duas, Prophets' Duas

## 📁 Project Structure

```
islamic-site/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home page
│   │   ├── prayer-times/    # Prayer times page
│   │   ├── azkar/          # Azkar page
│   │   └── quran/          # Quran page
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PrayerTimesCard.tsx
│   │   └── ToastProvider.tsx
│   ├── contexts/           # React Context providers
│   │   └── UserContext.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── api.ts
│   │   └── translations.ts
│   └── data/               # Static data files
│       ├── azkar.json      # Arabic Azkar
│       └── azkar-en.json   # English Azkar
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind configuration
```

## 🎯 Key Components

### UserContext
Manages global state including:
- User location and prayer times
- Theme preferences (dark/light)
- Language preferences (Arabic/English)
- Loading states
- Local storage persistence

### PrayerTimesCard
Displays current prayer times with:
- Real-time countdown to next prayer
- Visual indicators for current prayer
- Responsive grid layout
- Location-based calculations

### Azkar System
Interactive supplication system with:
- Category filtering
- Individual counters
- Progress tracking
- Completion indicators
- Bilingual content

### Quran Reader
Complete Quran reading experience:
- Surah browsing and search
- Ayah-by-ayah display
- Arabic text formatting
- Metadata display
- Responsive sidebar navigation

## 🌙 Features in Detail

### Prayer Times Calculation
- Uses Aladhan API for accurate calculations
- Supports multiple calculation methods (MWL, ISNA, etc.)
- Handles different madhabs (Shafi, Hanafi, etc.)
- Real-time updates and countdown timers

### Azkar Categories
- **Morning Adhkar**: Supplications for the morning
- **Evening Adhkar**: Supplications for the evening
- **Post-Prayer Azkar**: Supplications after prayer
- **Tasbeeh**: Glorification and remembrance
- **Azkar Before Sleep**: Bedtime supplications
- **Azkar Upon Waking**: Morning awakening supplications
- **Quranic Duas**: Supplications from the Quran
- **Prophets' Duas**: Supplications of the prophets

### Quran Features
- **Surah List**: Browse all 114 surahs
- **Search**: Find surahs by name or number
- **Ayah Display**: Read individual verses
- **Metadata**: Juz, page numbers, revelation type
- **Sajda Indicators**: Mark verses requiring prostration
- **Responsive Sidebar**: Easy navigation between surahs

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

**Live Demo:** [https://islamic-site-lemon.vercel.app/](https://islamic-site-lemon.vercel.app/)

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Customization

### Adding More Azkar
Edit the JSON files in `src/data/` to add more supplications:
- `azkar.json` for Arabic content
- `azkar-en.json` for English content

### Changing Prayer Calculation Method
Update the `calculationMethod` in `UserContext.tsx`:
- 1: MWL (Muslim World League)
- 2: ISNA (Islamic Society of North America)
- 3: Egypt
- 4: Makkah
- 5: Karachi
- 6: Tehran
- 7: Jafari

### Styling
Modify `tailwind.config.ts` and `src/app/globals.css` for custom styling.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Aladhan API** for prayer times calculation
- **AlQuran Cloud API** for Quran data
- **OpenWeatherMap API** for city search functionality
- **Islamic scholars** for authentic azkar content
- **Open source community** for tools and libraries

## 📞 Support

For questions or support, please open an issue on GitHub.

## 🌟 About This Project

This Islamic site was built with the intention of providing Muslims worldwide with easy access to essential Islamic tools and resources. The platform combines modern web technologies with authentic Islamic content to create a comprehensive digital companion for daily Islamic practices.

**Key Goals:**
- Provide accurate prayer times for any location
- Offer authentic azkar with proper translations
- Enable easy Quran reading and study
- Create a beautiful, accessible, and user-friendly interface
- Support both Arabic and English languages
- Maintain Islamic authenticity and respect

**May Allah accept our efforts and guide us all. آمين**

---

*Built with ❤️ for the Ummah*

**Live Site:** [https://islamic-site-lemon.vercel.app/](https://islamic-site-lemon.vercel.app/)
