/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - Cultural Quotes & Countdown Rotator
 * 12-15s cycling of nostalgic Bengali quotes and live countdown
 */

export class QuotesAndCountdown {
  constructor(quotes = []) {
    this.quotes = quotes;
    this.currentIndex = 0;
    this.quoteTimer = null;
    this.countdownTimer = null;
  }

  setQuotes(quotes) {
    this.quotes = quotes || [];
    this.startQuoteRotation();
  }

  startQuoteRotation() {
    if (this.quoteTimer) clearInterval(this.quoteTimer);
    if (!this.quotes || this.quotes.length === 0) return;

    this.renderCurrentQuote();

    this.quoteTimer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
      this.renderCurrentQuote();
    }, 12000);
  }

  renderCurrentQuote() {
    if (!this.quotes[this.currentIndex]) return;
    const item = this.quotes[this.currentIndex];

    // Navbar rotator
    const navElem = document.getElementById('nav-quote-rotator');
    if (navElem) {
      navElem.style.opacity = '0';
      setTimeout(() => {
        navElem.textContent = `“${item.quote}”`;
        navElem.style.opacity = '1';
      }, 400);
    }

    // Sidebar Quote Card
    const cardText = document.getElementById('sidebar-quote-text');
    const cardSub = document.getElementById('sidebar-quote-subtext');
    if (cardText && cardSub) {
      cardText.style.opacity = '0';
      cardSub.style.opacity = '0';
      setTimeout(() => {
        cardText.textContent = item.quote;
        cardSub.textContent = item.subtext;
        cardText.style.opacity = '1';
        cardSub.style.opacity = '1';
      }, 400);
    }
  }

  startCountdown(targetYear = null) {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    const updateCountdown = () => {
      const now = new Date();
      const currentYear = targetYear || now.getFullYear();

      // Durga Puja tentative calendar calculation for the year
      // Autumn festival (September - October)
      // Reference dates: 2026 Puja Shasthi is around October 16, 2026
      let pujaDate = new Date(currentYear, 9, 16, 6, 0, 0); // Month is 0-indexed (9 = Oct)

      // If this year's puja has passed, calculate for next year
      if (now > new Date(currentYear, 9, 21, 23, 59, 59)) {
        pujaDate = new Date(currentYear + 1, 9, 5, 6, 0, 0);
      }

      const diff = pujaDate.getTime() - now.getTime();
      const badgeElem = document.getElementById('puja-countdown-text');
      if (!badgeElem) return;

      // If during Puja days (between Shasthi and Dashami)
      const isDuringPuja = diff <= 0 && diff > -5 * 24 * 60 * 60 * 1000;
      if (isDuringPuja) {
        badgeElem.innerHTML = '<strong>শুভ দুর্গাপূজা!</strong>';
        return;
      }

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // Format in Bengali numerals
        const toBn = (num) => {
          const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
          return String(num).split('').map(d => bnDigits[d] || d).join('');
        };

        badgeElem.innerHTML = `পুজো আসতে আর <strong>${toBn(days)}</strong> দিন <strong>${toBn(hours)}</strong> ঘণ্টা <strong>${toBn(minutes)}</strong> মিনিট`;
      } else {
        badgeElem.innerHTML = '<strong>শুভ দুর্গাপূজা!</strong>';
      }
    };

    updateCountdown();
    this.countdownTimer = setInterval(updateCountdown, 60000);
  }

  destroy() {
    if (this.quoteTimer) clearInterval(this.quoteTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}
