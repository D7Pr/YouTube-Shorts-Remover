// ---------------------------
// config.js (defaults, can be overridden via sync storage)
// ---------------------------
const DEFAULT_CONFIG = {
  version: "2.1.0",
  enabled: true,
  patterns: [
    "ytd-rich-shelf-renderer",     // shorts shelf
    "ytd-reel-item-renderer",      // feed shorts
    "ytd-guide-entry-renderer[aria-label*='Shorts']", // sidebar tab
    "ytd-compact-video-renderer a[href*='/shorts/']",  // related shorts
    "tp-yt-paper-tab[title='Shorts']",                // shorts nav tab
    "ytd-video-renderer a[href*='/shorts/']",         // search results shorts
    "#dismissed.style-scope.ytd-rich-shelf-renderer",  // dismissed shorts shelf
    "ytd-rich-section-renderer[is-shorts]",           // shorts section
    "ytd-reel-shelf-renderer",                        // another shorts shelf variant
    "ytd-shorts-carousel-shelf-renderer",             // carousel shorts
    "#shorts-container",                              // shorts container
    "ytd-grid-video-renderer a[href*='/shorts/']",    // grid shorts
    "ytd-compact-movie-renderer a[href*='/shorts/']", // compact shorts
    "ytm-pivot-bar-item-renderer[tab-identifier='pivot-shorts']", // mobile shorts tab
    ".reel-shelf-items-container"                     // more shorts items
  ],
  customPatterns: [], // user-defined selectors
  redirectShortsPage: false,
  logging: true,
  logLevel: "info", // debug|info|warn|error
  showCounter: true, // show counter of removed shorts
  performance: {
    batchSize: 10,    // process in batches for performance
    throttleMs: 100,  // throttle frequency for mutation observer
    maxItems: 200     // max items to process in one batch
  },
  stats: {
    totalRemoved: 0,
    lastCleanup: null
  }
};