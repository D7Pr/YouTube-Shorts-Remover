// ---------------------------
// background.js
// ---------------------------
importScripts('config.js');

// Handle installation and updates
chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    await chrome.storage.sync.set({ config: DEFAULT_CONFIG });
    log('info', 'Extension installed with default configuration');
    
    // Open options page on install
    chrome.tabs.create({ url: 'options.html' });
  } else if (details.reason === 'update') {
    // Get existing config and merge with default (preserving user settings)
    const { config } = await chrome.storage.sync.get('config');
    const merged = { 
      ...DEFAULT_CONFIG,
      ...config,
      // Ensure patterns are merged, not overwritten
      patterns: [...new Set([...DEFAULT_CONFIG.patterns, ...(config.patterns || [])])],
      version: DEFAULT_CONFIG.version, // Always update version
      // Add new properties from default config
      stats: { ...DEFAULT_CONFIG.stats, ...(config.stats || {}) },
      performance: { ...DEFAULT_CONFIG.performance, ...(config.performance || {}) }
    };
    
    await chrome.storage.sync.set({ config: merged });
    log('info', `Updated to v${DEFAULT_CONFIG.version}`);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'getConfig':
      chrome.storage.sync.get('config', data => {
        const config = data.config || DEFAULT_CONFIG;
        sendResponse({ config });
      });
      return true;
      
    case 'setConfig':
      chrome.storage.sync.set({ config: msg.config }, () => {
        log('info', 'Configuration updated');
        sendResponse({ success: true });
      });
      return true;
      
    case 'log':
      writeLog(msg.level, msg.text, sender);
      sendResponse({});
      return false;
      
    case 'updateStats':
      updateStatistics(msg.count);
      return false;
      
    case 'openPopup':
      chrome.action.openPopup();
      return false;
      
    case 'resetStats':
      resetStatistics();
      sendResponse({ success: true });
      return true;
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Execute content script when a YouTube page is loaded
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    try {
      const { config } = await chrome.storage.sync.get('config');
      
      if (config && config.enabled) {
        // Update badge
        updateBadge(config.stats?.totalRemoved || 0);
      }
    } catch (err) {
      log('error', `Tab update error: ${err.message}`);
    }
  }
});

// Write log to storage
async function writeLog(level, text, sender = null) {
  try {
    const ts = new Date().toISOString();
    const { config } = await chrome.storage.sync.get('config');
    
    // Check if logging is enabled and if the level is sufficient
    if (!config.logging) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(config.logLevel);
    const msgLevelIndex = levels.indexOf(level);
    
    if (msgLevelIndex < configLevelIndex) return;
    
    const { logs = [] } = await chrome.storage.local.get('logs');
    
    // Add source information if available
    let source = '';
    if (sender && sender.tab) {
      source = ` [${new URL(sender.tab.url).pathname}]`;
    }
    
    logs.push({ ts, level, text: text + source });
    
    // Keep log size manageable
    if (logs.length > 1000) logs.splice(0, logs.length - 1000);
    
    await chrome.storage.local.set({ logs });
  } catch (err) {
    console.error('Error writing log:', err);
  }
}

// Simplified logging function
function log(level, text) {
  writeLog(level, text);
}

// Update extension statistics
async function updateStatistics(count) {
  try {
    const { config } = await chrome.storage.sync.get('config');
    
    if (!config.stats) config.stats = { totalRemoved: 0, lastCleanup: null };
    
    config.stats.totalRemoved = (config.stats.totalRemoved || 0) + count;
    config.stats.lastCleanup = new Date().toISOString();
    
    await chrome.storage.sync.set({ config });
    
    // Update badge
    updateBadge(config.stats.totalRemoved);
  } catch (err) {
    log('error', `Failed to update stats: ${err.message}`);
  }
}

// Reset statistics
async function resetStatistics() {
  try {
    const { config } = await chrome.storage.sync.get('config');
    
    config.stats = { totalRemoved: 0, lastCleanup: null };
    
    await chrome.storage.sync.set({ config });
    log('info', 'Statistics reset');
    
    // Update badge
    updateBadge(0);
  } catch (err) {
    log('error', `Failed to reset stats: ${err.message}`);
  }
}

// Update extension badge
function updateBadge(count) {
  const text = count > 0 ? count.toString() : '';
  
  // Truncate large numbers
  let displayText = text;
  if (count > 999) {
    displayText = Math.floor(count / 1000) + 'k';
  }
  
  chrome.action.setBadgeText({ text: displayText });
  chrome.action.setBadgeBackgroundColor({ color: '#f44336' });
  
  // Set title for hover tooltip
  chrome.action.setTitle({ title: `YouTube Shorts Remover: ${count} shorts removed` });
}