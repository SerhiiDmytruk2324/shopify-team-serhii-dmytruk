class ResponsiveVideo extends HTMLElement {
  constructor() {
    super();
    this.desktopVideo = this.querySelector('.video-desktop');
    this.mobileVideo = this.querySelector('.video-mobile');
    this.checkScreenSize = this.checkScreenSize.bind(this);

    // Set initial state
    this.checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', this.checkScreenSize);
  }

  checkScreenSize() {
    if (this.desktopVideo && this.mobileVideo) {
      const isMobile = window.matchMedia('(max-width: 749px)').matches;
      
      if (isMobile) {
        this.desktopVideo.style.display = 'none';
        this.mobileVideo.style.display = 'block';
      } else {
        this.desktopVideo.style.display = 'block';
        this.mobileVideo.style.display = 'none';
      }
    }
  }
}

customElements.define('responsive-video', ResponsiveVideo);