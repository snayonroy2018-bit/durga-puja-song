/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Instant Bilingual Search Engine
 * Sub-millisecond indexed search across Bengali, English, Artists, Tags & Moods
 */

export class SearchEngine {
  constructor(catalog = []) {
    this.catalog = catalog;
    this.indexed = [];
    this.buildIndex();
  }

  setCatalog(catalog) {
    this.catalog = catalog || [];
    this.buildIndex();
  }

  buildIndex() {
    this.indexed = this.catalog.map(song => {
      const singerStr = (song.singers || []).join(' ').toLowerCase();
      const tagsStr = (song.tags || []).join(' ').toLowerCase();
      const moodStr = (song.mood || []).join(' ').toLowerCase();
      const titleLower = (song.title || '').toLowerCase();
      const bnLower = (song.bengaliTitle || '').toLowerCase();
      const decadeStr = (song.decade || '').toLowerCase();
      const yearStr = song.year ? String(song.year) : '';

      return {
        song,
        searchCorpus: `${titleLower} ${bnLower} ${singerStr} ${tagsStr} ${moodStr} ${decadeStr} ${yearStr}`
      };
    });
  }

  search(query) {
    if (!query || !query.trim()) {
      return this.catalog;
    }

    const cleaned = query.trim().toLowerCase();
    const tokens = cleaned.split(/\s+/);

    return this.indexed
      .filter(item => {
        return tokens.every(token => item.searchCorpus.includes(token));
      })
      .map(item => item.song);
  }
}
