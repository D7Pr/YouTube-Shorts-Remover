// ---------------------------
// config.js (defaults, can be overridden via sync storage)
// ---------------------------
const DEFAULT_CONFIG = {
  version: "2.2.0",
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
    ".reel-shelf-items-container",                     // more shorts items
    "ytd-rich-shelf-renderer[is-shorts]",             // new shorts shelf format
    "ytd-shorts-lockup-view-model-v2",                // new shorts component
    "ytd-reel-video-renderer",                        // reel video components
    "ytd-shorts-shelf-renderer",                      // direct shorts shelf
    "yt-formatted-string[aria-label*='Shorts']",      // shorts labels
    "[href*='youtube.com/shorts/']",                  // any shorts links
    "ytd-compact-radio-renderer a[href*='/shorts/']", // compact shorts in radio
    "ytd-playlist-video-renderer a[href*='/shorts/']", // shorts in playlists
    "ytd-channel-video-player-renderer a[href*='/shorts/']", // channel shorts
    "div[aria-label*='Shorts']",                      // generic shorts divs
    ".shorts-shelf",                                  // CSS class-based shorts
    "#shorts-section",                                // shorts section by ID
    "ytd-mini-guide-entry-renderer[aria-label*='Shorts']" // mini guide shorts
  ],
  customPatterns: [], // user-defined selectors
  redirectShortsPage: false,
  logging: true,
  logLevel: "info", // debug|info|warn|error
  showCounter: true, // show counter of removed shorts
  performance: {
    batchSize: 20,    // process in batches for performance
    throttleMs: 50,   // throttle frequency for mutation observer
    maxItems: 1000,   // max items to process in one batch (increased from 200)
    maxBatchTime: 100 // max time per batch in milliseconds
  },
  stats: {
    totalRemoved: 0,
    lastCleanup: null
  }
};