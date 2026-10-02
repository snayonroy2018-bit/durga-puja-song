/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Multi-faceted Filter Engine
 * Category, Singer, Decade, Mood, Favorites, and Recently Played filtering
 */

export class FilterEngine {
  constructor(catalog = [], storage) {
    this.catalog = catalog;
    this.storage = storage;
    this.activeFilters = {
      category: 'all',
      singer: null,
      decade: null,
      mood: null,
      favoritesOnly: false,
      recentsOnly: false
    };
  }

  setCatalog(catalog) {
    this.catalog = catalog || [];
  }

  setCategory(category) {
    this.activeFilters.category = category || 'all';
    this.activeFilters.favoritesOnly = false;
    this.activeFilters.recentsOnly = false;
  }

  setSinger(singer) {
    this.activeFilters.singer = singer;
  }

  setDecade(decade) {
    this.activeFilters.decade = decade;
  }

  setMood(mood) {
    this.activeFilters.mood = mood;
  }

  setFavoritesOnly(flag) {
    this.activeFilters.favoritesOnly = flag;
    if (flag) {
      this.activeFilters.category = 'favorites';
      this.activeFilters.recentsOnly = false;
    }
  }

  setRecentsOnly(flag) {
    this.activeFilters.recentsOnly = flag;
    if (flag) {
      this.activeFilters.category = 'recents';
      this.activeFilters.favoritesOnly = false;
    }
  }

  resetFilters() {
    this.activeFilters = {
      category: 'all',
      singer: null,
      decade: null,
      mood: null,
      favoritesOnly: false,
      recentsOnly: false
    };
  }

  apply(baseList = null) {
    let list = baseList || this.catalog;

    // Favorites Filter
    if (this.activeFilters.favoritesOnly) {
      const favIds = this.storage ? this.storage.getFavorites() : [];
      return list.filter(song => favIds.includes(song.id));
    }

    // Recents Filter
    if (this.activeFilters.recentsOnly) {
      const recents = this.storage ? this.storage.getRecentlyPlayed() : [];
      const recentIds = recents.map(r => r.id);
      return list.filter(song => recentIds.includes(song.id));
    }

    // Category Filter: Strict 1-to-1 matching - one song belongs exclusively to one category
    if (this.activeFilters.category && this.activeFilters.category !== 'all') {
      const cat = this.activeFilters.category;
      if (cat === 'agomoni') {
        // In আগমনী গান option only agomoni songs are allowed; modern and mahalaya songs are strictly excluded
        list = list.filter(song => {
          if (song.primaryCategory !== 'agomoni') return false;
          const text = `${song.title || ''} ${song.bengaliTitle || ''} ${(song.tags || []).join(' ')} ${song.album || ''}`.toLowerCase();
          const singers = (song.singers || []).join(' ').toLowerCase();
          const isMahalaya = singers.includes('birendra krishna') || singers.includes('বীরেন্দ্রকৃষ্ণ') ||
            ['mahalaya', 'মহালয়া', 'mahisasur', 'mahishasur', 'মহিষাসুর', 'chandipath', 'চণ্ডীপাঠ', 'alor benu', 'aalor benu', 'আলোর বেণু', 'আলোর বেনু', 'aham rudre', 'ahang rudre', 'madhukaitava', 'rupang dehi', 'dashapraharana'].some(k => text.includes(k));
          if (isMahalaya) return false;
          const isModern = ['dj ', 'remix', 'lofi', 'slowed', 'reverb', 'shei bochhorer', 'nikhita gandhi', 'sunidhi chauhan', 'arijit singh', 'challenge 2'].some(k => text.includes(k) || singers.includes(k));
          if (isModern) return false;
          return true;
        });
      } else {
        list = list.filter(song => song.primaryCategory === cat);
      }
    }

    // Singer Filter
    if (this.activeFilters.singer) {
      const s = this.activeFilters.singer.toLowerCase();
      list = list.filter(song => {
        return (song.singers || []).some(singer => singer.toLowerCase().includes(s));
      });
    }

    // Decade Filter
    if (this.activeFilters.decade) {
      const d = this.activeFilters.decade;
      list = list.filter(song => song.decade === d || (song.tags && song.tags.includes(d.toLowerCase())));
    }

    // Mood Filter
    if (this.activeFilters.mood) {
      const m = this.activeFilters.mood.toLowerCase();
      list = list.filter(song => (song.mood || []).some(mood => mood.toLowerCase() === m));
    }

    return list;
  }

  getActiveCategory() {
    return this.activeFilters.category;
  }
}
