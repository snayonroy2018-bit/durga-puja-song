/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Favorites Manager
 * 'MY PUJA PLAYLIST' (আমার পুজোর গান) controller
 */

export class FavoritesManager {
  constructor(storage, onUpdate = () => {}) {
    this.storage = storage;
    this.onUpdate = onUpdate;
  }

  isFavorite(songId) {
    return this.storage.isFavorite(songId);
  }

  toggle(songId) {
    const isFav = this.storage.toggleFavorite(songId);
    this.onUpdate(songId, isFav);
    return isFav;
  }

  getAll() {
    return this.storage.getFavorites();
  }

  getCount() {
    return this.storage.getFavorites().length;
  }
}
