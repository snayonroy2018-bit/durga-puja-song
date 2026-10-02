# DURGA PUJA SONG (দুর্গাপূজার গান)

**পুজোর গান • পুজোর স্মৃতি • পুজোর আবেগ**  
*বাঙালির সবচেয়ে প্রিয় পাঁচ দিনের সুর*

---

## 🌺 Overview

**DURGA PUJA SONG (দুর্গাপূজার গান)** is a digital nostalgic Bengali Durga Puja music and radio web application inspired by vintage online radio stations. It provides an emotional, culturally authentic Bengali festive experience celebrating the divine awakening of Mahalaya, dawn Agomoni melodies, thunderous Dhaak rhythms, evening Sandhya Aarti, para pandal loudspeakers, pandal-hopping memories, and golden era classics across the 80s, 90s, and 2000s.

The site is powered by **over 2,300+ real, verified Bengali songs** curated from official music labels (Saregama Bengali, SVF Devotional, Asha Audio, Zee Music Bangla, T-Series Bangla, Venus Bengali, etc.) and played through the official **YouTube IFrame Player API**. Zero audio files are hosted or downloaded, strictly respecting rights holders.

---

## ✨ Key Features

1. **2,300+ Curated Unique Bengali Songs**:
   - Spanning **13 distinct categories**: Agomoni (আগমনী), Mahalaya (মহালয়া), Durga Puja Songs (দুর্গাপূজা গান), Dhaak (ঢাকের বাদ্য), Aarti (আরতি), Pandal Songs (প্যান্ডেলের গান), 80s, 90s, 2000s, Old Classics, Pandal Hopping, Romantic Puja (পুজোর প্রেম), and Modern Puja.
   - Rich multi-tag system with dual Bengali/English titles, singer metadata, release decades, and moods.
   - Strict **Rule 6 compliance**: No invented data. All tracks have real YouTube video IDs.

2. **Custom Audio Player & Smart Queue**:
   - Controlled via the official YouTube IFrame Player API.
   - Non-repeating Fisher-Yates shuffle queue that plays every song before resetting and avoids immediate repeats.
   - Up Next list showing upcoming 4–5 tracks.
   - Auto-advance on track end without page reload.
   - Automatic fallback skip for restricted/unavailable videos with a warm Bengali toast:  
     *"এই গানটি এখন চালানো যাচ্ছে না — পরের গান চালানো হচ্ছে।"*

3. **14 Dynamic Visual Themes & Canvas Atmosphere**:
   - Atmospheric background crossfades, slight zoom, and color palettes for every category.
   - Canvas particle engine:
     - 🌺 Falling Shiuli petals (white petals with saffron stems) in Agomoni mode.
     - 🪔 Dhunuchi fragrant smoke curls and golden embers in Aarti/Dhaak modes.
     - 🌾 Swaying Kaash phool plumes in autumn themes.
     - 🏮 Twinkling fairy lights and street bokeh in Pandal/Night modes.
   - Fully supports `prefers-reduced-motion`.

4. **Nostalgic Radio & Retro Cassette Deck**:
   - **Akashvani Decade Dial**: Analog tuning needle allowing instant jumping across `OLD`, `80s`, `90s`, `00s`, and `MODERN`.
   - **Cassette Deck Spools**: Rotating spools in 80s, 90s, and Nostalgia modes.
   - **Interactive Modes**:
     - 📻 **Puja Radio (পুজোর রেডিও)**: Continuous stream across the entire collection.
     - 🌅 **Mahalaya Mode (মহালয়া)**: Pre-dawn navy/gold ambiance, Chandi Path, incense.
     - 🏮 **Pandal Hopping (প্যান্ডেল হপিং)**: High-energy crowd and street food anthems.
     - 📼 **Puja Nostalgia (নস্ট্যালজিয়া)**: 80s & 90s cassette spools, warm analog glow.
     - ❤️ **Puja Prem (পুজোর প্রেম)**: Intimate evening romantic melodies and bokeh.

5. **Instant Bilingual Search & Multi-Filters**:
   - Sub-millisecond in-memory search across Bengali and English titles, artists, albums, and tags.
   - Filters for Category, Decade, Mood (Devotional, Festive, Energetic, Romantic, Nostalgic), and Priority Singers.

6. **King & Queen of Bengali Music Directory**:
   - Dedicated profiles for legendary vocalists: Kumar Sanu, Kishore Kumar, Hemanta Mukhopadhyay, Asha Bhosle, Lata Mangeshkar, Manna Dey, Sandhya Mukhopadhyay, Arati Mukherjee, Haimanti Shukla, Nachiketa, Srikanta Acharya, Rupankar, Anupam Roy, Shreya Ghoshal, Alka Yagnik, Bappi Lahiri, Mita Chatterjee, Birendra Krishna Bhadra, Shaan, Sonu Nigam, Udit Narayan, Arijit Singh, and more.

7. **Bengali Cultural Utilities**:
   - **Durga Puja Countdown**: Live countdown to the upcoming Durga Puja or *"শুভ দুর্গাপূজা"* during the festival.
   - **Dynamic Quotes**: 30+ nostalgic Bengali Puja memories cycling every 12 seconds.
   - **Favorites & Playlists**: LocalStorage-backed "আমার পছন্দের পুজোর গান" (My Puja Playlist).
   - **Deep Linking**: Shareable URLs (`/?song=dps_000123`) with clipboard copy feedback.

8. **Admin Management Console**:
   - In-browser modal to inspect catalog metrics, export JSON backups, and import JSON/CSV updates without editing code.

9. **Progressive Web App (PWA)**:
   - Installable on Android, iPhone, Windows, and macOS.
   - Caches website shell and assets for rapid loading. Never caches YouTube video/audio streams.

---

## 📂 Project Architecture

```
durga-puja-song/
├── index.html                    # Single-page application shell
├── manifest.json                 # PWA Manifest
├── service-worker.js             # Asset caching service worker
├── README.md                     # Documentation & setup guide
├── .env.example                  # Environment configuration template
├── .gitignore                    # Secrets & transient file ignore rules
├── css/
│   ├── main.css                  # Core design tokens, layout & player styles
│   ├── themes.css                # 14 category-specific visual atmospheres
│   ├── animations.css            # Particle effects, equalizer & transitions
│   └── responsive.css            # Mobile-first & desktop responsive rules
├── js/
│   ├── app.js                    # Main application coordinator
│   ├── player.js                 # YouTube IFrame API wrapper & auto-advance
│   ├── queue.js                  # Fisher-Yates smart shuffle & history
│   ├── theme-manager.js          # Dynamic background & theme controller
│   ├── search.js                 # Fast bilingual search engine
│   ├── filters.js                # Category, decade, mood & artist filters
│   ├── favorites.js              # LocalStorage favorites manager
│   ├── storage.js                # Storage abstraction
│   ├── quotes.js                 # Bengali quotes rotator & countdown timer
│   ├── radio.js                  # Nostalgic radio tuning dial & modes
│   ├── visualizer.js             # Canvas particle engine & equalizer
│   ├── share.js                  # Deep links & toast notifications
│   └── admin.js                  # In-browser catalog admin modal
├── data/
│   ├── songs.json                # 2,300+ curated, verified Bengali songs
│   ├── categories.json           # 13 cultural category definitions
│   ├── singers.json              # 50+ iconic Bengali artists metadata
│   └── quotes.json               # 30+ evocative Bengali Puja quotes
├── assets/
│   ├── icons/                    # Cultural SVGs (Trishul, Dhaak, Dhunuchi, etc.)
│   └── images/                   # Visual textures and backdrops
└── tools/
    ├── collect-youtube-songs.js  # Node.js YouTube Data API collector
    ├── collect_youtube_songs.py  # Python collector core
    ├── build_catalog.py          # Primary 180+ query aggregator
    ├── expand_catalog.py         # Secondary expansion query aggregator
    ├── deduplicate.js            # Metadata normalizer & duplicate remover
    └── validate-songs.js         # YouTube oEmbed link accessibility validator
```

---

## 🚀 Running Locally

The frontend is built with pure Vanilla HTML5, modern CSS, and ES6 JavaScript modules with zero build step dependencies required to run the site:

### Option 1: Python Built-in Server (Installed by default)
```bash
# From the project root:
python -m http.server 8000
```
Then open your browser at:
```text
http://localhost:8000
```

### Option 2: Node.js / Any Static Server
```bash
npx serve .
# or
npx live-server .
```

---

## 🌐 Production Deployment

The project is static and production-ready. You can deploy it instantly to:

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Choose defaults (Static HTML).

### Netlify
1. Drag and drop the `durga-puja-song/` folder into [Netlify Drop](https://app.netlify.com/drop).
2. Or use Netlify CLI: `npx netlify deploy --prod --dir=.`

### Cloudflare Pages
1. Connect your Git repository to Cloudflare Pages.
2. Build command: None (leave blank).
3. Output directory: `.` or root.

### GitHub Pages
1. Push repository to GitHub.
2. In Repository Settings → Pages, select the `main` branch and `/ (root)` folder.

---

## 🛠️ Catalog Maintenance & Expansion

To collect more songs using the YouTube Data API:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your YouTube API Key in `.env`:
   ```text
   YOUTUBE_API_KEY=AIzaSy...
   ```
3. Run the Node.js or Python collector:
   ```bash
   node tools/collect-youtube-songs.js
   # or
   python tools/build_catalog.py
   ```
4. Deduplicate and normalize:
   ```bash
   node tools/deduplicate.js
   ```
5. Validate video accessibility:
   ```bash
   node tools/validate-songs.js
   ```

---

## 📜 Cultural Attribution & Disclaimer

*Durga Puja Song (দুর্গাপূজার গান) is an independent cultural music tribute created to celebrate the memories, sounds, and emotions of Durga Puja.*

*All audio and video playback is delivered via official third-party embeds (YouTube IFrame Player API). The platform does not host, convert, or distribute copyrighted audio files. All rights, royalties, and ownership remain strictly with the respective artists, lyricists, composers, and music labels.*

**শুভ শারদীয়া! মা আসছেন ঘরে...**
