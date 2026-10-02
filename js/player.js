/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - YouTube Player Integration
 * Official YouTube IFrame Player API wrapper with auto-advance and error auto-skip
 */

export class YouTubePlayer {
  constructor(options = {}) {
    this.containerId = options.containerId || 'youtube-player-container';
    this.onTrackChange = options.onTrackChange || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onError = options.onError || (() => {});
    this.onTimeUpdate = options.onTimeUpdate || (() => {});

    this.ytPlayer = null;
    this.isReady = false;
    this.isPlaying = false;
    this.currentSong = null;
    this.progressInterval = null;
    this.volume = options.initialVolume || 80;
    this.isMuted = options.initialMuted || false;

    this.initYouTubeAPI();
  }

  initYouTubeAPI() {
    // Check if YouTube API script is already on page
    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    // Define global callback
    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };

    // Dynamically inject IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  createPlayer() {
    this.ytPlayer = new window.YT.Player(this.containerId, {
      height: '200',
      width: '200',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => this.handleReady(event),
        onStateChange: (event) => this.handleStateChange(event),
        onError: (event) => this.handleError(event)
      }
    });
  }

  handleReady(event) {
    this.isReady = true;
    this.setVolume(this.volume);
    if (this.isMuted) this.mute();
    console.log('DURGA PUJA SONG: YouTube IFrame Player Ready.');

    if (this.pendingSong) {
      this.loadSong(this.pendingSong, this.pendingAutoPlay);
      this.pendingSong = null;
    }
  }

  loadSong(song, autoPlay = true) {
    if (!song || !song.youtubeId) return;
    this.currentSong = song;

    if (!this.isReady || !this.ytPlayer) {
      this.pendingSong = song;
      this.pendingAutoPlay = autoPlay;
      this.onTrackChange(song);
      return;
    }

    try {
      if (autoPlay) {
        this.ytPlayer.loadVideoById({
          videoId: song.youtubeId,
          startSeconds: 0
        });
        this.isPlaying = true;
      } else {
        this.ytPlayer.cueVideoById({
          videoId: song.youtubeId,
          startSeconds: 0
        });
        this.isPlaying = false;
      }
      this.onTrackChange(song);
      this.startProgressTracking();
    } catch (err) {
      console.error('Error loading video:', err);
      this.handleError({ data: 100 });
    }
  }

  play() {
    if (!this.isReady || !this.ytPlayer) return;
    try {
      this.ytPlayer.playVideo();
      this.isPlaying = true;
      this.startProgressTracking();
    } catch (e) {}
  }

  pause() {
    if (!this.isReady || !this.ytPlayer) return;
    try {
      this.ytPlayer.pauseVideo();
      this.isPlaying = false;
      this.stopProgressTracking();
    } catch (e) {}
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seekTo(seconds) {
    if (!this.isReady || !this.ytPlayer) return;
    try {
      this.ytPlayer.seekTo(seconds, true);
    } catch (e) {}
  }

  setVolume(val) {
    this.volume = val;
    if (this.isReady && this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(val);
    }
  }

  mute() {
    this.isMuted = true;
    if (this.isReady && this.ytPlayer && typeof this.ytPlayer.mute === 'function') {
      this.ytPlayer.mute();
    }
  }

  unMute() {
    this.isMuted = false;
    if (this.isReady && this.ytPlayer && typeof this.ytPlayer.unMute === 'function') {
      this.ytPlayer.unMute();
    }
  }

  toggleMute() {
    if (this.isMuted) {
      this.unMute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  handleStateChange(event) {
    // YouTube Player States:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.startProgressTracking();
      this.onStateChange('playing');
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      this.stopProgressTracking();
      this.onStateChange('paused');
    } else if (event.data === window.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.stopProgressTracking();
      this.onStateChange('ended');
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      this.onStateChange('buffering');
    }
  }

  handleError(event) {
    // Codes: 2 (invalid param), 5 (HTML5 error), 100 (not found/private), 101/150 (not embeddable)
    console.warn(`YouTube Error code: ${event ? event.data : 'unknown'}. Skipping track automatically.`);
    this.onError({
      code: event ? event.data : 100,
      song: this.currentSong,
      message: 'এই গানটি এখন চালানো যাচ্ছে না — পরের গান চালানো হচ্ছে।'
    });
  }

  startProgressTracking() {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      if (!this.isReady || !this.ytPlayer) return;
      try {
        const currentTime = this.ytPlayer.getCurrentTime() || 0;
        const duration = this.ytPlayer.getDuration() || 0;
        this.onTimeUpdate(currentTime, duration);
      } catch (e) {}
    }, 400);
  }

  stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  getCurrentTime() {
    if (!this.isReady || !this.ytPlayer) return 0;
    try {
      return this.ytPlayer.getCurrentTime() || 0;
    } catch (e) {
      return 0;
    }
  }

  getDuration() {
    if (!this.isReady || !this.ytPlayer) return 0;
    try {
      return this.ytPlayer.getDuration() || 0;
    } catch (e) {
      return 0;
    }
  }
}
