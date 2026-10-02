/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Deep Link & Share Manager
 * URL query parameters (?song=dps_xxxxxx) and copy-to-clipboard toast
 */

export class ShareManager {
  static getSongIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('song');
  }

  static updateUrlForSong(songId) {
    if (!songId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('song', songId);
    window.history.replaceState({ songId }, '', url.toString());
  }

  static copySongLink(song) {
    if (!song || !song.id) return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('song', song.id);

    const shareUrl = url.toString();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToast(`“${song.title}” লিংক কপি করা হয়েছে!`);
      }).catch(() => {
        this.fallbackCopy(shareUrl, song.title);
      });
    } else {
      this.fallbackCopy(shareUrl, song.title);
    }
  }

  static fallbackCopy(text, title) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      this.showToast(`“${title}” লিংক কপি করা হয়েছে!`);
    } catch (e) {
      this.showToast('লিংক কপি করা সম্ভব হয়নি।');
    }
    document.body.removeChild(input);
  }

  static showToast(message, isWarning = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isWarning ? 'toast-skip-notice' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 4500);
  }
}
