/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Smart Queue Engine
 * Non-repeating Fisher-Yates shuffle, Up Next queue, and history manager
 */

export class QueueManager {
  constructor() {
    this.fullCatalog = [];
    this.filteredList = [];
    this.currentIndex = -1;
    this.shuffleQueue = [];
    this.shuffleIndex = -1;
    this.isShuffle = false;
    this.isRepeat = false;
    this.playHistory = [];
  }

  setCatalog(songs) {
    this.fullCatalog = songs || [];
    this.filteredList = [...this.fullCatalog];
    this.rebuildShuffleQueue();
  }

  setFilteredList(songs, startSongId = null) {
    this.filteredList = songs && songs.length > 0 ? songs : [...this.fullCatalog];
    this.rebuildShuffleQueue();

    if (startSongId) {
      this.currentIndex = this.filteredList.findIndex(s => s.id === startSongId);
      if (this.currentIndex === -1) this.currentIndex = 0;
    } else {
      this.currentIndex = 0;
    }
  }

  rebuildShuffleQueue() {
    if (this.filteredList.length === 0) {
      this.shuffleQueue = [];
      this.shuffleIndex = -1;
      return;
    }

    // Fisher-Yates shuffle of indices
    const indices = Array.from({ length: this.filteredList.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Avoid playing current song first in new shuffle if possible
    if (this.currentIndex !== -1 && indices.length > 1 && indices[0] === this.currentIndex) {
      [indices[0], indices[1]] = [indices[1], indices[0]];
    }

    this.shuffleQueue = indices;
    this.shuffleIndex = 0;
  }

  getCurrentSong() {
    if (this.filteredList.length === 0) return null;
    if (this.currentIndex < 0 || this.currentIndex >= this.filteredList.length) {
      this.currentIndex = 0;
    }
    return this.filteredList[this.currentIndex];
  }

  setCurrentSongById(songId) {
    const idx = this.filteredList.findIndex(s => s.id === songId);
    if (idx !== -1) {
      this.currentIndex = idx;
      return this.filteredList[idx];
    }
    // Check in full catalog
    const fullIdx = this.fullCatalog.findIndex(s => s.id === songId);
    if (fullIdx !== -1) {
      this.filteredList = [...this.fullCatalog];
      this.currentIndex = fullIdx;
      this.rebuildShuffleQueue();
      return this.fullCatalog[fullIdx];
    }
    return null;
  }

  getNextSong() {
    if (this.filteredList.length === 0) return null;

    if (this.isRepeat && this.currentIndex !== -1) {
      return this.filteredList[this.currentIndex];
    }

    if (this.isShuffle) {
      this.shuffleIndex++;
      if (this.shuffleIndex >= this.shuffleQueue.length) {
        this.rebuildShuffleQueue();
      }
      this.currentIndex = this.shuffleQueue[this.shuffleIndex];
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.filteredList.length;
    }

    const next = this.filteredList[this.currentIndex];
    if (next) this.addToHistory(next);
    return next;
  }

  getPreviousSong() {
    if (this.filteredList.length === 0) return null;

    // Check history first
    if (this.playHistory.length > 1) {
      this.playHistory.pop(); // Remove current
      const prev = this.playHistory[this.playHistory.length - 1];
      const idx = this.filteredList.findIndex(s => s.id === prev.id);
      if (idx !== -1) {
        this.currentIndex = idx;
        return this.filteredList[idx];
      }
    }

    // Fallback to sequential previous
    this.currentIndex = (this.currentIndex - 1 + this.filteredList.length) % this.filteredList.length;
    return this.filteredList[this.currentIndex];
  }

  getUpNext(count = 5) {
    if (this.filteredList.length <= 1) return [];
    const results = [];

    if (this.isShuffle) {
      let tempIdx = this.shuffleIndex;
      for (let i = 1; i <= count; i++) {
        tempIdx = (tempIdx + 1) % this.shuffleQueue.length;
        const songIdx = this.shuffleQueue[tempIdx];
        if (this.filteredList[songIdx]) {
          results.push(this.filteredList[songIdx]);
        }
      }
    } else {
      for (let i = 1; i <= count; i++) {
        const nextIdx = (this.currentIndex + i) % this.filteredList.length;
        if (this.filteredList[nextIdx]) {
          results.push(this.filteredList[nextIdx]);
        }
      }
    }
    return results;
  }

  addToHistory(song) {
    if (!song) return;
    this.playHistory.push(song);
    if (this.playHistory.length > 50) {
      this.playHistory.shift();
    }
  }

  setShuffle(shuffle) {
    this.isShuffle = shuffle;
    if (shuffle) this.rebuildShuffleQueue();
  }

  setRepeat(repeat) {
    this.isRepeat = repeat;
  }
}
