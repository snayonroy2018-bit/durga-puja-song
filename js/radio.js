/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Radio & Nostalgia Controller
 * Analog decade tuner dial (OLD ─ 80s ─ 90s ─ 00s ─ MODERN) and interactive modes
 */

export class RadioController {
  constructor(options = {}) {
    this.onDecadeChange = options.onDecadeChange || (() => {});
    this.onModeChange = options.onModeChange || (() => {});
    this.activeDecade = 'all';
    this.activeMode = null;

    this.initEventListeners();
  }

  initEventListeners() {
    // Decade Dial Steps
    const dialSteps = document.querySelectorAll('.dial-step');
    dialSteps.forEach(step => {
      step.addEventListener('click', (e) => {
        const decade = e.currentTarget.dataset.decade;
        this.selectDecade(decade);
      });
    });

    // Special Mode Buttons
    const modeButtons = document.querySelectorAll('.btn-mode-card, .btn-nav-radio');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        if (mode) this.selectMode(mode);
      });
    });
  }

  selectDecade(decade) {
    this.activeDecade = decade;

    // Update active class on dial steps
    document.querySelectorAll('.dial-step').forEach(step => {
      if (step.dataset.decade === decade) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    this.onDecadeChange(decade);
  }

  selectMode(mode) {
    this.activeMode = mode;

    // Update active styling
    document.querySelectorAll('.btn-mode-card').forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.onModeChange(mode);
  }

  reset() {
    this.activeDecade = 'all';
    this.activeMode = null;
    document.querySelectorAll('.dial-step').forEach(step => {
      if (step.dataset.decade === 'all') step.classList.add('active');
      else step.classList.remove('active');
    });
    document.querySelectorAll('.btn-mode-card').forEach(btn => btn.classList.remove('active'));
  }
}
