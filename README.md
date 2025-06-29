# Islamic Site - Prayer Times, Azkar & Quran

A comprehensive Islamic web platform providing prayer times, daily azkar (supplications), and Quran reading with a beautiful, modern UI.

## 🌟 Features

### 🕌 Prayer Times
- **Location-based prayer times** using the Aladhan API
- **Real-time updates** with current time and next prayer countdown
- **Manual city search** or automatic geolocation
- **Multiple calculation methods** and madhabs
- **Beautiful visual display** with prayer time cards

### 📿 Daily Azkar
- **Categorized supplications** (Morning, Evening, After Prayer)
- **Interactive counters** for tracking progress
- **Arabic text with transliteration** and English translation
- **Reference citations** from authentic sources
- **Progress indicators** and completion tracking

### 📖 Quran Reader
- **Complete Quran** with all 114 surahs
- **Search functionality** by name, translation, or number
- **Ayah-by-ayah display** with proper Arabic formatting
- **Sajda verse indicators** and detailed metadata
- **Responsive design** for all devices

### 🎨 User Experience
- **Dark/Light theme** toggle
- **Responsive design** for mobile and desktop
- **Fast loading** with optimized performance
- **Accessible design** with proper contrast and navigation
- **Local storage** for user preferences

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Context API
- **APIs**: 
  - Aladhan API (Prayer Times)
  - AlQuran Cloud API (Quran)
  - Static JSON (Azkar)
- **Deployment**: Vercel (ready)

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

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
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
- **Categories**: Morning, Evening, After Prayer, General

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
│   │   └── PrayerTimesCard.tsx
│   ├── contexts/           # React Context providers
│   │   └── UserContext.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Utility functions
│       └── api.ts
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind configuration
```

## 🎯 Key Components

### UserContext
Manages global state including:
- User location and prayer times
- Theme preferences (dark/light)
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

### Quran Reader
Complete Quran reading experience:
- Surah browsing and search
- Ayah-by-ayah display
- Arabic text formatting
- Metadata display

## 🌙 Features in Detail

### Prayer Times Calculation
- Uses Aladhan API for accurate calculations
- Supports multiple calculation methods (MWL, ISNA, etc.)
- Handles different madhabs (Shafi, Hanafi, etc.)
- Real-time updates and countdown timers

### Azkar Categories
- **Morning Azkar**: Supplications for the morning
- **Evening Azkar**: Supplications for the evening
- **After Prayer**: Post-prayer supplications
- **General**: Miscellaneous supplications

### Quran Features
- **Surah List**: Browse all 114 surahs
- **Search**: Find surahs by name or number
- **Ayah Display**: Read individual verses
- **Metadata**: Juz, page numbers, revelation type
- **Sajda Indicators**: Mark verses requiring prostration

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Customization

### Adding More Azkar
Edit `src/utils/api.ts` to add more supplications to the `fetchAzkar` function.

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
- **Islamic scholars** for authentic azkar content
- **Open source community** for tools and libraries

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**May Allah accept our efforts and guide us all. آمين**

*Built with ❤️ for the Ummah*
