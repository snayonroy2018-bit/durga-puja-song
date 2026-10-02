/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Visualizer & Canvas Particle Engine
 * Realistic Shiuli petals, Dhunuchi fragrant smoke, Kaash blooms, and Equalizer
 */

export class VisualizerEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.maxParticles = 50;
    this.currentTheme = 'durga-puja';
    this.isPlaying = false;
    this.animId = null;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initParticles();
      this.startLoop();
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setTheme(themeId) {
    this.currentTheme = themeId || 'durga-puja';
    this.initParticles();
  }

  setPlaying(playing) {
    this.isPlaying = playing;
    const body = document.body;
    if (playing) {
      body.classList.add('is-playing');
    } else {
      body.classList.remove('is-playing');
    }
  }

  initParticles() {
    this.particles = [];
    const count = this.maxParticles;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const w = this.canvas ? this.canvas.width : window.innerWidth;
    const h = this.canvas ? this.canvas.height : window.innerHeight;

    if (this.currentTheme === 'agomoni') {
      // Falling Shiuli petals (white petal with orange center stem)
      return {
        type: 'shiuli',
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 4 + Math.random() * 4,
        speedY: 0.8 + Math.random() * 1.4,
        speedX: -0.5 + Math.random() * 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.3 + Math.random() * 0.6
      };
    } else if (this.currentTheme === 'dhaak' || this.currentTheme === 'aarti' || this.currentTheme === 'mahalaya') {
      // Dhunuchi fragrant smoke curls & golden spark embers
      return {
        type: Math.random() > 0.4 ? 'smoke' : 'ember',
        x: Math.random() * w,
        y: h - Math.random() * 300,
        radius: 12 + Math.random() * 24,
        speedY: -(0.6 + Math.random() * 1.2),
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: 0.15 + Math.random() * 0.25,
        scale: 1,
        maxScale: 2.2
      };
    } else if (this.currentTheme === 'pandal' || this.currentTheme === 'modern' || this.currentTheme === 'pandal-hopping') {
      // Festive fairy lights & Bokeh orbs
      return {
        type: 'bokeh',
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 6 + Math.random() * 16,
        speedY: (Math.random() - 0.5) * 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: 0.1 + Math.random() * 0.3,
        color: ['#f7d774', '#e1bee7', '#80deea', '#ff8a80'][Math.floor(Math.random() * 4)]
      };
    } else {
      // Durga Puja divine golden devotional spark particles
      return {
        type: 'golden-dust',
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 1.5 + Math.random() * 2.5,
        speedY: -(0.2 + Math.random() * 0.6),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: 0.2 + Math.random() * 0.6
      };
    }
  }

  startLoop() {
    const loop = () => {
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (p.type === 'shiuli') {
        // Render Shiuli flower petal
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // White petal
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Distinct orange/saffron stalk center
        ctx.fillStyle = '#ff6f00';
        ctx.beginPath();
        ctx.arc(-p.radius * 0.5, 0, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.02) * 0.8 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
      } else if (p.type === 'smoke') {
        // Dhunuchi Smoke swirl
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = 'rgba(230, 220, 210, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.scale += 0.003;
        p.opacity -= 0.0006;

        if (p.opacity <= 0 || p.y < -50) {
          Object.assign(p, this.createParticle());
        }
      } else if (p.type === 'bokeh') {
        // Festive light bokeh
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color || '#f7d774';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
        }
      } else {
        // Golden dust
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#f7d774';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
      }
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
