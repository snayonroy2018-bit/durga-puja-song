/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Admin & Catalog Management Console
 * In-browser management for JSON/CSV import, export, and catalog validation
 */

import { ShareManager } from './share.js';

export class AdminConsole {
  constructor(catalog = [], onCatalogUpdate = () => {}) {
    this.catalog = catalog;
    this.onCatalogUpdate = onCatalogUpdate;
    this.modalElem = document.getElementById('admin-modal');
    this.initEventListeners();
  }

  setCatalog(catalog) {
    this.catalog = catalog || [];
  }

  initEventListeners() {
    const openBtn = document.getElementById('btn-open-admin');
    const closeBtn = document.getElementById('btn-close-admin');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Export Button
    const exportBtn = document.getElementById('admin-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportJSON());
    }

    // Import File Input
    const importInput = document.getElementById('admin-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => this.handleImport(e));
    }
  }

  open() {
    if (!this.modalElem) return;
    this.renderStats();
    this.modalElem.classList.add('open');
  }

  close() {
    if (!this.modalElem) return;
    this.modalElem.classList.remove('open');
  }

  renderStats() {
    const statsContainer = document.getElementById('admin-stats-summary');
    if (!statsContainer) return;

    const total = this.catalog.length;
    const catCounts = {};
    const singerCounts = {};

    this.catalog.forEach(s => {
      const c = s.primaryCategory || 'uncategorized';
      catCounts[c] = (catCounts[c] || 0) + 1;
      (s.singers || []).forEach(singer => {
        singerCounts[singer] = (singerCounts[singer] || 0) + 1;
      });
    });

    statsContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.2rem;">
        <div style="background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: #f7d774;">মোট গান (TOTAL SONGS)</div>
          <div style="font-size: 1.6rem; font-weight: 700;">${total}</div>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: #f7d774;">ক্যাটাগরি (CATEGORIES)</div>
          <div style="font-size: 1.6rem; font-weight: 700;">${Object.keys(catCounts).length}</div>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: #f7d774;">শিল্পী (ARTISTS)</div>
          <div style="font-size: 1.6rem; font-weight: 700;">${Object.keys(singerCounts).length}</div>
        </div>
      </div>
      <div style="font-size: 0.85rem; max-height: 180px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 8px;">
        <strong>ক্যাটাগরি অনুযায়ী গানের সংখ্যা:</strong><br/>
        ${Object.entries(catCounts).map(([cat, count]) => `• ${cat}: <strong>${count}</strong>`).join('<br/>')}
      </div>
    `;
  }

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.catalog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `durga_puja_songs_catalog_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    ShareManager.showToast('ক্যাটালগ সফলভাবে এক্সপোর্ট হয়েছে!');
  }

  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let imported = [];
        if (file.name.endsWith('.json')) {
          imported = JSON.parse(event.target.result);
        } else if (file.name.endsWith('.csv')) {
          imported = this.parseCSV(event.target.result);
        }

        if (Array.isArray(imported) && imported.length > 0) {
          this.catalog = imported;
          this.onCatalogUpdate(this.catalog);
          this.renderStats();
          ShareManager.showToast(`${imported.length}টি গান সফলভাবে ইম্পোর্ট করা হয়েছে!`);
        } else {
          ShareManager.showToast('ভুল ফাইল ফরম্যাট।', true);
        }
      } catch (err) {
        console.error('Import error:', err);
        ShareManager.showToast('ফাইল ইম্পোর্ট করতে সমস্যা হয়েছে।', true);
      }
    };
    reader.readAsText(file);
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const songs = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 3) {
        songs.push({
          id: cols[0] || `dps_${String(i).padStart(6, '0')}`,
          title: cols[1] || 'Bengali Song',
          bengaliTitle: cols[2] || '',
          singers: cols[3] ? [cols[3]] : ['Various Artists'],
          youtubeId: cols[4] || '',
          primaryCategory: cols[5] || 'durga-puja',
          tags: [cols[5] || 'durga-puja'],
          decade: '1990s',
          language: 'Bengali',
          verified: true,
          embeddable: true
        });
      }
    }
    return songs;
  }
}
