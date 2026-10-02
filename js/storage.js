/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Local Storage Manager
 * Persistent state for Favorites, Recently Played, Preferences
 */

const STORAGE_KEYS = {
  FAVORITES: 'dps_favorites',
  RECENTLY_PLAYED: 'dps_recently_played',
  VOLUME: 'dps_volume',
  MUTED: 'dps_muted',
  REPEAT: 'dps_repeat',
  SHUFFLE: 'dps_shuffle',
  FIRST_RUN_SEEN: 'dps_welcome_seen',
  LAST_SONG: 'dps_last_played_song'
};

export const StorageManager = {
  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read favorites from storage', e);
      return [];
    }
  },

  isFavorite(songId) {
    const favs = this.getFavorites();
    return favs.includes(songId);
  },

  toggleFavorite(songId) {
    let favs = this.getFavorites();
    if (favs.includes(songId)) {
      favs = favs.filter(id => id !== songId);
    } else {
      favs.push(songId);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    } catch (e) {}
    return favs.includes(songId);
  },

  getRecentlyPlayed() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addRecentlyPlayed(song) {
    if (!song || !song.id) return;
    let recents = this.getRecentlyPlayed();
    recents = recents.filter(s => s.id !== song.id);
    recents.unshift({
      id: song.id,
      title: song.title,
      bengaliTitle: song.bengaliTitle,
      singers: song.singers,
      youtubeId: song.youtubeId,
      primaryCategory: song.primaryCategory,
      timestamp: Date.now()
    });
    // Keep max 30 recent tracks
    if (recents.length > 30) {
      recents = recents.slice(0, 30);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(recents));
    } catch (e) {}
  },

  getVolume() {
    const val = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return val !== null ? parseInt(val, 10) : 80;
  },

  setVolume(vol) {
    localStorage.setItem(STORAGE_KEYS.VOLUME, vol);
  },

  isMuted() {
    return localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
  },

  setMuted(muted) {
    localStorage.setItem(STORAGE_KEYS.MUTED, muted ? 'true' : 'false');
  },

  isShuffle() {
    return localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true';
  },

  setShuffle(shuffle) {
    localStorage.setItem(STORAGE_KEYS.SHUFFLE, shuffle ? 'true' : 'false');
  },

  isRepeat() {
    return localStorage.getItem(STORAGE_KEYS.REPEAT) === 'true';
  },

  setRepeat(repeat) {
    localStorage.setItem(STORAGE_KEYS.REPEAT, repeat ? 'true' : 'false');
  },

  hasSeenWelcome() {
    return localStorage.getItem(STORAGE_KEYS.FIRST_RUN_SEEN) === 'true';
  },

  setSeenWelcome() {
    localStorage.setItem(STORAGE_KEYS.FIRST_RUN_SEEN, 'true');
  },

  getLastSongId() {
    return localStorage.getItem(STORAGE_KEYS.LAST_SONG);
  },

  setLastSongId(id) {
    if (id) localStorage.setItem(STORAGE_KEYS.LAST_SONG, id);
  }
};
