/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Theme Manager
 * Orchestrates dynamic category atmospheres, crossfades, and special modes
 */

export class ThemeManager {
  constructor(visualizer) {
    this.visualizer = visualizer;
    this.currentTheme = 'durga-puja';
    this.bgArtLayer = document.getElementById('bg-art-layer');
    this.bgApp = document.getElementById('app-background');
  }

  setTheme(themeKey) {
    if (!themeKey) return;
    this.currentTheme = themeKey;

    // Remove all previous theme classes
    const body = document.body;
    const classes = Array.from(body.classList).filter(c => c.startsWith('theme-') || c.startsWith('mode-'));
    classes.forEach(c => body.classList.remove(c));

    // Add new theme class
    body.classList.add(`theme-${themeKey}`);

    // Update particle generator
    if (this.visualizer) {
      this.visualizer.setTheme(themeKey);
    }

    // Trigger subtle background zoom animation
    if (this.bgArtLayer) {
      this.bgArtLayer.classList.remove('bg-zoom-active');
      void this.bgArtLayer.offsetWidth; // trigger reflow
      this.bgArtLayer.classList.add('bg-zoom-active');
    }
  }

  setSpecialMode(modeKey) {
    const body = document.body;
    body.classList.remove('mode-radio', 'mode-mahalaya', 'mode-pandal-hopping', 'mode-nostalgia', 'mode-romantic');

    switch (modeKey) {
      case 'radio':
        body.classList.add('mode-radio');
        break;
      case 'mahalaya':
        body.classList.add('mode-mahalaya');
        this.setTheme('mahalaya');
        break;
      case 'pandal-hopping':
        body.classList.add('mode-pandal-hopping');
        this.setTheme('pandal-hopping');
        break;
      case 'nostalgia':
        body.classList.add('mode-nostalgia');
        this.setTheme('90s');
        break;
      case 'romantic':
        body.classList.add('mode-romantic');
        this.setTheme('romantic');
        break;
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}
