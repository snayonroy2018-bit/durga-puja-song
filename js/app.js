/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Main Application Controller
 * High-performance coordinator connecting audio, queue, search, themes, and Bengali UI
 */

import { StorageManager } from './storage.js';
import { YouTubePlayer } from './player.js';
import { QueueManager } from './queue.js';
import { ThemeManager } from './theme-manager.js';
import { VisualizerEngine } from './visualizer.js';
import { SearchEngine } from './search.js';
import { FilterEngine } from './filters.js';
import { FavoritesManager } from './favorites.js';
import { QuotesAndCountdown } from './quotes.js';
import { RadioController } from './radio.js';
import { AdminConsole } from './admin.js';
import { ShareManager } from './share.js';

export class DurgaPujaApp {
  constructor() {
    this.catalog = [];
    this.categories = [];
    this.singers = [];
    this.quotes = [];

    this.displayedSongsCount = 40;
    this.batchSize = 35;
    this.activeFilteredList = [];

    // Core Engines
    this.storage = StorageManager;
    this.visualizer = new VisualizerEngine('particle-canvas');
    this.themeManager = new ThemeManager(this.visualizer);
    this.queue = new QueueManager();
    this.searchEngine = new SearchEngine([]);
    this.filterEngine = new FilterEngine([], this.storage);
    this.quotesEngine = new QuotesAndCountdown([]);
    this.favorites = new FavoritesManager(this.storage, (songId, isFav) => this.handleFavoriteChange(songId, isFav));
    this.admin = new AdminConsole([], (updated) => this.handleCatalogUpdate(updated));

    this.player = new YouTubePlayer({
      initialVolume: this.storage.getVolume(),
      initialMuted: this.storage.isMuted(),
      onTrackChange: (song) => this.onTrackChanged(song),
      onStateChange: (state) => this.onPlaybackStateChanged(state),
      onError: (err) => this.onPlaybackError(err),
      onTimeUpdate: (cur, dur) => this.onPlaybackTimeUpdate(cur, dur)
    });

    this.queue.setShuffle(this.storage.isShuffle());
    this.queue.setRepeat(this.storage.isRepeat());

    this.radio = new RadioController({
      onDecadeChange: (decade) => this.handleDecadeChange(decade),
      onModeChange: (mode) => this.handleModeChange(mode)
    });

    this.isSeeking = false;
  }

  async init() {
    console.log('Initializing DURGA PUJA SONG application...');
    await this.loadData();

    this.setupEngines();
    this.renderCategoriesList();
    this.renderSingersDirectory();
    this.renderSongList();
    this.updateUpNextList();
    this.bindEvents();
    this.checkFirstRun();
    this.handleDeepLink();

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(e => console.log('SW registration note:', e));
      });
    }
  }

  async loadData() {
    try {
      const [songsRes, catsRes, singersRes, quotesRes] = await Promise.all([
        fetch('./data/songs.json').then(r => r.json()).catch(() => []),
        fetch('./data/categories.json').then(r => r.json()).catch(() => []),
        fetch('./data/singers.json').then(r => r.json()).catch(() => []),
        fetch('./data/quotes.json').then(r => r.json()).catch(() => [])
      ]);

      this.catalog = songsRes || [];
      this.categories = catsRes || [];
      this.singers = singersRes || [];
      this.quotes = quotesRes || [];

      console.log(`Loaded ${this.catalog.length} songs, ${this.categories.length} categories, ${this.singers.length} singers.`);
    } catch (e) {
      console.error('Data load error:', e);
    }
  }

  setupEngines() {
    this.queue.setCatalog(this.catalog);
    this.searchEngine.setCatalog(this.catalog);
    this.filterEngine.setCatalog(this.catalog);
    this.admin.setCatalog(this.catalog);
    this.quotesEngine.setQuotes(this.quotes);
    this.quotesEngine.startCountdown();

    this.activeFilteredList = this.filterEngine.apply();

    // Sync shuffle and repeat button states in UI
    const shuffleBtn = document.getElementById('btn-shuffle');
    if (shuffleBtn && this.storage.isShuffle()) shuffleBtn.classList.add('active');

    const repeatBtn = document.getElementById('btn-repeat');
    if (repeatBtn && this.storage.isRepeat()) repeatBtn.classList.add('active');

    // Volume slider sync
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) volSlider.value = this.storage.getVolume();
  }

  checkFirstRun() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;

    if (!this.storage.hasSeenWelcome()) {
      modal.classList.add('open');
    }

    const startBtn = document.getElementById('btn-welcome-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        this.storage.setSeenWelcome();
        // Start playing first song
        this.playFirstSong();
      });
    }

    const chooseBtn = document.getElementById('btn-welcome-choose');
    if (chooseBtn) {
      chooseBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        this.storage.setSeenWelcome();
      });
    }
  }

  handleDeepLink() {
    const targetSongId = ShareManager.getSongIdFromUrl();
    if (targetSongId) {
      const song = this.catalog.find(s => s.id === targetSongId);
      if (song) {
        this.queue.setCurrentSongById(targetSongId);
        this.player.loadSong(song, false); // cue without forced auto play if blocked
        this.themeManager.setTheme(song.primaryCategory);
      }
    } else {
      // Default to first track or Agomoni track
      const first = this.catalog[0];
      if (first) {
        this.queue.setCurrentSongById(first.id);
        this.player.loadSong(first, false);
      }
    }
  }

  playFirstSong() {
    const current = this.queue.getCurrentSong() || this.catalog[0];
    if (current) {
      this.player.loadSong(current, true);
    }
  }

  renderCategoriesList() {
    const container = document.getElementById('category-list-container');
    if (!container) return;

    // Build category count map: strictly 1 primary category per song
    const counts = {};
    this.catalog.forEach(s => {
      counts[s.primaryCategory] = (counts[s.primaryCategory] || 0) + 1;
    });

    // All songs button
    let html = `
      <button class="cat-item-btn active" data-category="all" id="cat-btn-all">
        <div class="cat-left">
          <span class="cat-icon">🎶</span>
          <span class="cat-name-bn">সব পুজোর গান</span>
        </div>
        <span class="cat-count-badge">${this.catalog.length}</span>
      </button>
    `;

    this.categories.forEach(cat => {
      const count = counts[cat.id] || 0;
      html += `
        <button class="cat-item-btn" data-category="${cat.id}">
          <div class="cat-left">
            <span class="cat-icon">${cat.icon}</span>
            <span class="cat-name-bn">${cat.bengaliName}</span>
          </div>
          <span class="cat-count-badge">${count}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll('.cat-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.category;
        this.selectCategory(cat);
      });
    });
  }

  renderSingersDirectory() {
    const grid = document.getElementById('singers-avatar-grid');
    if (!grid) return;

    const countBadge = document.getElementById('singers-count-badge');
    if (countBadge) {
      countBadge.textContent = `${this.singers.length || 29} জন`;
    }

    const currentSinger = this.filterEngine ? this.filterEngine.activeFilters.singer : null;
    let html = '';

    this.singers.forEach(singer => {
      // Calculate initials (up to 2 letters)
      const initials = singer.name
        .split(' ')
        .map(n => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('');

      const isActive = currentSinger && (
        currentSinger.toLowerCase() === singer.name.toLowerCase() ||
        (singer.bengaliName && currentSinger.toLowerCase().includes(singer.bengaliName.toLowerCase()))
      );

      html += `
        <button class="singer-badge-btn ${isActive ? 'active' : ''}" 
                data-singer="${singer.name}" 
                data-bn="${singer.bengaliName || singer.name}"
                title="${singer.name} (${singer.bengaliName || ''})">
          <div class="singer-avatar-mini">${initials}</div>
          <div class="singer-text-box">
            <span class="singer-bn-title">${singer.bengaliName || singer.name}</span>
            <span class="singer-en-sub">${singer.name}</span>
          </div>
        </button>
      `;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.singer-badge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const singerName = e.currentTarget.dataset.singer;
        const bnName = e.currentTarget.dataset.bn;
        
        // Toggle off if clicking the already active singer
        if (this.filterEngine.activeFilters.singer === singerName) {
          this.filterEngine.setSinger(null);
          this.activeFilteredList = this.filterEngine.apply();
          this.queue.setFilteredList(this.activeFilteredList);
          this.displayedSongsCount = this.batchSize;
          this.renderSongList();
          this.updateUpNextList();
          this.renderSingersDirectory();
          ShareManager.showToast('সমস্ত শিল্পীর গান দেখানো হচ্ছে');
        } else {
          this.filterBySinger(singerName, bnName);
        }
      });
    });
  }

  selectCategory(category) {
    // Update active category UI
    document.querySelectorAll('.cat-item-btn').forEach(btn => {
      if (btn.dataset.category === category) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    this.filterEngine.setCategory(category);
    this.activeFilteredList = this.filterEngine.apply();
    this.queue.setFilteredList(this.activeFilteredList);
    this.displayedSongsCount = this.batchSize;
    this.renderSongList();
    this.updateUpNextList();

    // Change background visual theme
    if (category !== 'all' && category !== 'favorites' && category !== 'recents') {
      this.themeManager.setTheme(category);
    } else {
      this.themeManager.setTheme('durga-puja');
    }
  }

  filterBySinger(singerName, bnName) {
    this.filterEngine.setSinger(singerName);
    this.activeFilteredList = this.filterEngine.apply();
    this.queue.setFilteredList(this.activeFilteredList);
    this.displayedSongsCount = this.batchSize;
    this.renderSongList();
    this.updateUpNextList();
    this.renderSingersDirectory();

    const label = bnName ? `${bnName} (${singerName})` : singerName;
    ShareManager.showToast(`শিল্পী: ${label}`);
  }

  handleDecadeChange(decade) {
    if (decade === 'all') {
      this.filterEngine.setDecade(null);
    } else {
      this.filterEngine.setDecade(decade);
    }
    this.activeFilteredList = this.filterEngine.apply();
    this.queue.setFilteredList(this.activeFilteredList);
    this.displayedSongsCount = this.batchSize;
    this.renderSongList();
    this.updateUpNextList();

    if (decade === '1980s' || decade === '80s') this.themeManager.setTheme('80s');
    else if (decade === '1990s' || decade === '90s') this.themeManager.setTheme('90s');
    else if (decade === '2000s' || decade === '00s') this.themeManager.setTheme('2000s');
    else if (decade === 'Old Classics' || decade === 'OLD') this.themeManager.setTheme('old-classics');
    else if (decade === 'Modern') this.themeManager.setTheme('modern');
  }

  handleModeChange(mode) {
    this.themeManager.setSpecialMode(mode);

    if (mode === 'radio') {
      // Continuous random playback
      this.filterEngine.resetFilters();
      this.queue.setShuffle(true);
      this.storage.setShuffle(true);
      const shuffleBtn = document.getElementById('btn-shuffle');
      if (shuffleBtn) shuffleBtn.classList.add('active');

      this.activeFilteredList = this.catalog;
      this.queue.setFilteredList(this.catalog);
      this.nextTrack();
      ShareManager.showToast('📻 পুজোর রেডিও চালু হয়েছে — অফুরন্ত সুর!');
    } else if (mode === 'mahalaya') {
      this.selectCategory('mahalaya');
      this.nextTrack();
      ShareManager.showToast('🌅 মহালয়া মোড সক্রিয় — আশ্বিনের শারদপ্রাতে...');
    } else if (mode === 'pandal-hopping') {
      this.selectCategory('pandal-hopping');
      this.nextTrack();
      ShareManager.showToast('🏮 প্যান্ডেল হপিং মোড সক্রিয়!');
    } else if (mode === 'nostalgia') {
      this.selectCategory('90s');
      this.nextTrack();
      ShareManager.showToast('📼 পুজো নস্ট্যালজিয়া মোড — সোনালী দিনের সুর');
    } else if (mode === 'romantic') {
      this.selectCategory('romantic');
      this.nextTrack();
      ShareManager.showToast('❤️ পুজোর প্রেম মোড — মনের মানুষের সাথে সুর');
    }
  }

  renderSongList() {
    const container = document.getElementById('song-list-container');
    const countLabel = document.getElementById('catalog-results-count');
    if (!container) return;

    const songsToRender = this.activeFilteredList.slice(0, this.displayedSongsCount);
    if (countLabel) {
      countLabel.textContent = `${this.activeFilteredList.length}টি গান`;
    }

    if (songsToRender.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🌺</div>
          <div style="font-size: 1.1rem; color: var(--gold-light);">কোনো গান পাওয়া যায়নি</div>
          <div style="font-size: 0.85rem; margin-top: 0.4rem;">অন্য কোনো নাম বা ক্যাটাগরি দিয়ে খুঁজে দেখুন।</div>
        </div>
      `;
      return;
    }

    const currentSong = this.queue.getCurrentSong();
    let html = '';

    songsToRender.forEach(song => {
      const isNowPlaying = currentSong && currentSong.id === song.id;
      const isFav = this.favorites.isFavorite(song.id);
      const singersStr = (song.singers || []).join(', ') || 'Various Artists';
      const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;

      html += `
        <div class="song-card ${isNowPlaying ? 'now-playing' : ''}" data-song-id="${song.id}">
          <div class="song-thumb-wrapper">
            <img class="song-thumb" src="${thumbUrl}" alt="${song.title}" loading="lazy" />
            <div class="thumb-play-overlay">
              <span>${isNowPlaying ? '❚❚' : '▶'}</span>
            </div>
          </div>
          <div class="song-info">
            <div class="song-title-row">
              <span class="song-title-main">${song.bengaliTitle || song.title}</span>
            </div>
            ${song.bengaliTitle ? `<span class="song-title-sub">${song.title}</span>` : ''}
            <span class="song-artists">${singersStr}</span>
          </div>
          <div class="song-category-badge">${song.primaryCategory || 'puja'}</div>
          <div class="song-decade-year">${song.year || song.decade || ''}</div>
          <div class="song-actions">
            <button class="btn-card-fav ${isFav ? 'favorited' : ''}" data-song-id="${song.id}" title="পছন্দের গান">
              ${isFav ? '❤️' : '🤍'}
            </button>
            <button class="btn-card-share" data-song-id="${song.id}" title="শেয়ার করুন" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.85rem;">
              🔗
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach row clicks
    container.querySelectorAll('.song-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-fav') || e.target.closest('.btn-card-share')) return;
        const songId = card.dataset.songId;
        this.playSongById(songId);
      });
    });

    // Attach favorite buttons
    container.querySelectorAll('.btn-card-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = btn.dataset.songId;
        const isFav = this.favorites.toggle(songId);
        btn.textContent = isFav ? '❤️' : '🤍';
        btn.classList.toggle('favorited', isFav);
        ShareManager.showToast(isFav ? 'গানটি আপনার পছন্দের তালিকায় যোগ করা হয়েছে!' : 'পছন্দের তালিকা থেকে বাদ দেওয়া হয়েছে।');
      });
    });

    // Attach share buttons
    container.querySelectorAll('.btn-card-share').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = btn.dataset.songId;
        const song = this.catalog.find(s => s.id === songId);
        if (song) ShareManager.copySongLink(song);
      });
    });

    // Manage Load More button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
      if (this.displayedSongsCount < this.activeFilteredList.length) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  loadMoreSongs() {
    this.displayedSongsCount += this.batchSize;
    this.renderSongList();
  }

  playSongById(songId) {
    const song = this.queue.setCurrentSongById(songId);
    if (song) {
      this.player.loadSong(song, true);
      this.storage.addRecentlyPlayed(song);
      this.storage.setLastSongId(song.id);
      ShareManager.updateUrlForSong(song.id);
      this.renderSongList();
      this.updateUpNextList();
    }
  }

  nextTrack() {
    const next = this.queue.getNextSong();
    if (next) {
      this.player.loadSong(next, true);
      this.storage.addRecentlyPlayed(next);
      this.storage.setLastSongId(next.id);
      ShareManager.updateUrlForSong(next.id);
      this.renderSongList();
      this.updateUpNextList();
    }
  }

  prevTrack() {
    const prev = this.queue.getPreviousSong();
    if (prev) {
      this.player.loadSong(prev, true);
      this.storage.addRecentlyPlayed(prev);
      this.storage.setLastSongId(prev.id);
      ShareManager.updateUrlForSong(prev.id);
      this.renderSongList();
      this.updateUpNextList();
    }
  }

  updateUpNextList() {
    const container = document.getElementById('up-next-container');
    if (!container) return;

    const nextSongs = this.queue.getUpNext(4);
    if (nextSongs.length === 0) {
      container.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">পরের কোনো গান নেই</div>';
      return;
    }

    let html = '';
    nextSongs.forEach(song => {
      const thumb = `https://img.youtube.com/vi/${song.youtubeId}/default.jpg`;
      html += `
        <div class="up-next-card" data-song-id="${song.id}">
          <img class="up-next-thumb" src="${thumb}" alt="${song.title}" />
          <div class="up-next-info">
            <span class="up-next-title">${song.bengaliTitle || song.title}</span>
            <span class="up-next-singer">${(song.singers || [])[0] || 'Bengali Singer'}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.up-next-card').forEach(card => {
      card.addEventListener('click', () => {
        const songId = card.dataset.songId;
        this.playSongById(songId);
      });
    });
  }

  onTrackChanged(song) {
    if (!song) return;

    // Center player metadata
    const titleBn = document.getElementById('track-title-bn');
    const titleEn = document.getElementById('track-title-en');
    const singerEl = document.getElementById('track-singers');
    const catBadge = document.getElementById('track-category-badge');
    const yearEl = document.getElementById('track-meta-year');
    const albumEl = document.getElementById('track-meta-album');
    const artwork = document.getElementById('stage-artwork-img');

    // Artwork & YouTube Thumbnail
    const highThumb = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
    if (artwork) artwork.src = highThumb;

    // Fade animation on change
    const showcase = document.getElementById('track-showcase-container');
    if (showcase) {
      showcase.classList.add('track-fade-out');
      setTimeout(() => {
        if (titleBn) titleBn.textContent = song.bengaliTitle || song.title;
        if (titleEn) titleEn.textContent = song.bengaliTitle ? song.title : '';
        if (singerEl) singerEl.textContent = (song.singers || []).join(', ');
        if (catBadge) catBadge.textContent = song.primaryCategory || 'puja';
        if (yearEl) yearEl.textContent = song.year || song.decade || 'Bengali Classic';
        if (albumEl) albumEl.textContent = song.album || song.sourceChannel || 'Durga Puja';

        showcase.classList.remove('track-fade-out');
        showcase.classList.add('track-fade-in');
      }, 250);
    }

    // Bottom mini-player sync
    const miniTitle = document.getElementById('mini-track-title');
    const miniSinger = document.getElementById('mini-track-singer');
    const miniThumb = document.getElementById('mini-thumb-img');
    if (miniTitle) miniTitle.textContent = song.bengaliTitle || song.title;
    if (miniSinger) miniSinger.textContent = (song.singers || []).join(', ');
    if (miniThumb) miniThumb.src = highThumb;

    // Update favorite button status on center and bottom
    const isFav = this.favorites.isFavorite(song.id);
    const mainFavBtn = document.getElementById('btn-main-fav');
    if (mainFavBtn) {
      mainFavBtn.textContent = isFav ? '❤️' : '🤍';
      mainFavBtn.classList.toggle('active', isFav);
    }

    // Dynamic background switch if category changed
    this.themeManager.setTheme(song.primaryCategory);
  }

  onPlaybackStateChanged(state) {
    const playBtns = document.querySelectorAll('.btn-ctrl-play, #btn-main-play, #btn-mini-play');

    if (state === 'playing') {
      this.visualizer.setPlaying(true);
      playBtns.forEach(btn => btn.textContent = '❚❚');
    } else if (state === 'paused') {
      this.visualizer.setPlaying(false);
      playBtns.forEach(btn => btn.textContent = '▶');
    } else if (state === 'ended') {
      this.visualizer.setPlaying(false);
      // Auto-advance to next track smoothly
      this.nextTrack();
    }
  }

  onPlaybackError(err) {
    ShareManager.showToast(err.message || 'এই গানটি এখন চালানো যাচ্ছে না — পরের গান চালানো হচ্ছে।', true);
    // Automatic fallback skip
    setTimeout(() => {
      this.nextTrack();
    }, 800);
  }

  onPlaybackTimeUpdate(currentTime, duration) {
    if (this.isSeeking) return;

    const curLabel = document.getElementById('time-current');
    const durLabel = document.getElementById('time-duration');
    const scrubberProg = document.getElementById('scrubber-progress');
    const miniProg = document.getElementById('mini-scrubber-progress');

    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (curLabel) curLabel.textContent = formatTime(currentTime);
    if (durLabel) durLabel.textContent = formatTime(duration);

    if (duration > 0) {
      const pct = (currentTime / duration) * 100;
      if (scrubberProg) scrubberProg.style.width = `${pct}%`;
      if (miniProg) miniProg.style.width = `${pct}%`;
    }
  }

  bindEvents() {
    // Play/Pause toggles
    document.querySelectorAll('.btn-ctrl-play, #btn-main-play, #btn-mini-play').forEach(btn => {
      btn.addEventListener('click', () => this.player.togglePlay());
    });

    // Next / Prev
    document.querySelectorAll('.btn-ctrl-next, #btn-main-next, #btn-mini-next').forEach(btn => {
      btn.addEventListener('click', () => this.nextTrack());
    });

    document.querySelectorAll('.btn-ctrl-prev, #btn-main-prev, #btn-mini-prev').forEach(btn => {
      btn.addEventListener('click', () => this.prevTrack());
    });

    // Shuffle toggle
    const shuffleBtn = document.getElementById('btn-shuffle');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        const nextState = !this.queue.isShuffle;
        this.queue.setShuffle(nextState);
        this.storage.setShuffle(nextState);
        shuffleBtn.classList.toggle('active', nextState);
        this.updateUpNextList();
        ShareManager.showToast(nextState ? 'স্মার্ট শাফল চালু হয়েছে' : 'শাফল বন্ধ করা হয়েছে');
      });
    }

    // Repeat toggle
    const repeatBtn = document.getElementById('btn-repeat');
    if (repeatBtn) {
      repeatBtn.addEventListener('click', () => {
        const nextState = !this.queue.isRepeat;
        this.queue.setRepeat(nextState);
        this.storage.setRepeat(nextState);
        repeatBtn.classList.toggle('active', nextState);
        ShareManager.showToast(nextState ? 'গান পুনরাবৃত্তি (Repeat) চালু' : 'রিপিট বন্ধ');
      });
    }

    // Main Favorite button
    const mainFavBtn = document.getElementById('btn-main-fav');
    if (mainFavBtn) {
      mainFavBtn.addEventListener('click', () => {
        const cur = this.queue.getCurrentSong();
        if (cur) {
          const isFav = this.favorites.toggle(cur.id);
          mainFavBtn.textContent = isFav ? '❤️' : '🤍';
          mainFavBtn.classList.toggle('active', isFav);
          ShareManager.showToast(isFav ? 'পছন্দের তালিকায় গান যোগ করা হয়েছে!' : 'তালিকা থেকে সরানো হয়েছে।');
          this.renderSongList();
        }
      });
    }

    // Main Share button
    const mainShareBtn = document.getElementById('btn-main-share');
    if (mainShareBtn) {
      mainShareBtn.addEventListener('click', () => {
        const cur = this.queue.getCurrentSong();
        if (cur) ShareManager.copySongLink(cur);
      });
    }

    // Favorites Filter in Navbar
    const navFavBtn = document.getElementById('btn-nav-favorites');
    if (navFavBtn) {
      navFavBtn.addEventListener('click', () => {
        this.filterEngine.setFavoritesOnly(true);
        this.activeFilteredList = this.filterEngine.apply();
        this.queue.setFilteredList(this.activeFilteredList);
        this.displayedSongsCount = this.batchSize;
        this.renderSongList();
        this.updateUpNextList();
        ShareManager.showToast('আমার পছন্দের পুজোর গান (My Puja Playlist)');
      });
    }

    // Volume Slider
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.player.setVolume(val);
        this.storage.setVolume(val);
      });
    }

    // Mute Button
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.player.toggleMute();
        this.storage.setMuted(isMuted);
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Scrubber seeking
    const scrubber = document.getElementById('scrubber-bar');
    if (scrubber) {
      scrubber.addEventListener('click', (e) => {
        const rect = scrubber.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const duration = this.player.getDuration();
        if (duration > 0) {
          this.player.seekTo(pos * duration);
        }
      });
    }

    // Instant Search Input with debounce (compact search bar in navbar)
    const searchInput = document.getElementById('nav-search-input') || document.getElementById('catalog-search-input');
    let searchDebounce = null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          const query = e.target.value;
          const searchResults = this.searchEngine.search(query);
          this.activeFilteredList = this.filterEngine.apply(searchResults);
          this.queue.setFilteredList(this.activeFilteredList);
          this.displayedSongsCount = this.batchSize;
          this.renderSongList();
          this.updateUpNextList();
        }, 180);
      });
    }

    // Load More Button
    const loadMoreBtn = document.getElementById('btn-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMoreSongs());
    }

    // Mood filter pills
    document.querySelectorAll('.filter-pill[data-mood]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const mood = e.currentTarget.dataset.mood;
        const wasActive = e.currentTarget.classList.contains('active');
        document.querySelectorAll('.filter-pill[data-mood]').forEach(p => p.classList.remove('active'));

        if (wasActive) {
          this.filterEngine.setMood(null);
        } else {
          e.currentTarget.classList.add('active');
          this.filterEngine.setMood(mood);
        }

        this.activeFilteredList = this.filterEngine.apply();
        this.queue.setFilteredList(this.activeFilteredList);
        this.displayedSongsCount = this.batchSize;
        this.renderSongList();
        this.updateUpNextList();
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.player.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.nextTrack();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevTrack();
      } else if (e.code === 'KeyM') {
        const isMuted = this.player.toggleMute();
        this.storage.setMuted(isMuted);
      }
    });
  }

  handleFavoriteChange(songId, isFav) {
    this.renderSongList();
  }

  handleCatalogUpdate(updatedCatalog) {
    this.catalog = updatedCatalog;
    this.setupEngines();
    this.renderCategoriesList();
    this.renderSongList();
    this.updateUpNextList();
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DurgaPujaApp();
  app.init();
  window.DurgaPujaAppInstance = app;
});
