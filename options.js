// ---------------------------
// options.js
// ---------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Tab Navigation
  setupTabs();
  
  // Load configuration
  await loadConfig();
  
  // Load logs
  await loadLogs();
  
  // Setup event listeners
  setupEventListeners();
});

// Tab navigation functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding pane
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// Load configuration from storage
async function loadConfig() {
  try {
    const { config } = await new Promise(resolve => 
      chrome.runtime.sendMessage({ type: 'getConfig' }, resolve)
    );
    
    // Display version
    document.getElementById('version').textContent = config.version || '2.1.0';
    
    // Populate form fields
    document.getElementById('enabled').checked = config.enabled;
    document.getElementById('redirect').checked = config.redirectShortsPage;
    document.getElementById('showCounter').checked = config.showCounter !== false;
    document.getElementById('logging').checked = config.logging !== false;
    document.getElementById('logLevel').value = config.logLevel || 'info';
    
    // Fill textareas
    document.getElementById('patterns').value = config.patterns.join('\n');
    document.getElementById('custom').value = (config.customPatterns || []).join('\n');
    
    // Stats
    updateStatsDisplay(config.stats);
  } catch (err) {
    showNotification('Error loading settings: ' + err.message, 'error');
    console.error('Error loading config:', err);
  }
}

// Load logs from storage
async function loadLogs() {
  try {
    const { logs = [] } = await chrome.storage.local.get('logs');
    displayLogs(logs);
    
    // Setup log filter
    document.getElementById('logFilter').addEventListener('change', () => displayLogs(logs));
    document.getElementById('searchLogs').addEventListener('input', () => displayLogs(logs));
  } catch (err) {
    console.error('Error loading logs:', err);
  }
}

// Display logs in UI
function displayLogs(logs) {
  const viewer = document.getElementById('logViewer');
  const filterLevel = document.getElementById('logFilter').value;
  const searchTerm = document.getElementById('searchLogs').value.toLowerCase();
  
  // Filter logs based on level and search term
  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch = !searchTerm || 
                         log.text.toLowerCase().includes(searchTerm) || 
                         log.level.toLowerCase().includes(searchTerm);
    return matchesLevel && matchesSearch;
  });
  
  // Display filtered logs
  viewer.innerHTML = filteredLogs.map(log => {
    const time = log.ts.split('T')[1].split('.')[0]; // Format time as HH:MM:SS
    const date = log.ts.split('T')[0];
    return `
      <div class="log-entry">
        <span class="log-time">${date} ${time}</span>
        <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
        <span class="log-text">${escapeHtml(log.text)}</span>
      </div>
    `;
  }).join('') || '<div class="empty-state">No logs found</div>';
}

// Update stats display
function updateStatsDisplay(stats = {}) {
  const totalRemoved = document.getElementById('totalRemoved');
  const lastCleanup = document.getElementById('lastCleanup');
  
  totalRemoved.textContent = stats?.totalRemoved?.toLocaleString() || '0';
  
  if (stats?.lastCleanup) {
    const date = new Date(stats.lastCleanup);
    lastCleanup.textContent = date.toLocaleString();
  } else {
    lastCleanup.textContent = 'Never';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Save button
  document.getElementById('save').addEventListener('click', saveConfig);
  
  // Reset button
  document.getElementById('reset').addEventListener('click', resetConfig);
  
  // Clear logs button
  document.getElementById('clearLogs').addEventListener('click', clearLogs);
  
  // Download logs button
  document.getElementById('downloadLogs').addEventListener('click', downloadLogs);
  
  // Reset stats button
  document.getElementById('resetStats').addEventListener('click', resetStats);
}

// Save configuration
async function saveConfig() {
  try {
    const { config } = await new Promise(resolve => 
      chrome.runtime.sendMessage({ type: 'getConfig' }, resolve)
    );
    
    const newConfig = {
      ...config,
      enabled: document.getElementById('enabled').checked,
      redirectShortsPage: document.getElementById('redirect').checked,
      showCounter: document.getElementById('showCounter').checked,
      logging: document.getElementById('logging').checked,
      logLevel: document.getElementById('logLevel').value,
      patterns: document.getElementById('patterns').value.split('\n').filter(l => l.trim()),
      customPatterns: document.getElementById('custom').value.split('\n').filter(l => l.trim())
    };
    
    await new Promise(resolve => 
      chrome.runtime.sendMessage({ type: 'setConfig', config: newConfig }, resolve)
    );
    
    showNotification('Settings saved successfully!', 'success');
  } catch (err) {
    showNotification('Error saving settings: ' + err.message, 'error');
    console.error('Error saving config:', err);
  }
}

// Reset configuration to defaults
async function resetConfig() {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    try {
      // Get default config
      const { config } = await new Promise(resolve => 
        chrome.runtime.sendMessage({ type: 'getConfig' }, resolve)
      );
      
      // Reset to defaults but keep statistics
      const stats = config.stats || {};
      
      await new Promise(resolve => 
        chrome.runtime.sendMessage({ 
          type: 'setConfig', 
          config: { ...DEFAULT_CONFIG, stats } 
        }, resolve)
      );
      
      // Reload page to show default settings
      location.reload();
    } catch (err) {
      showNotification('Error resetting settings: ' + err.message, 'error');
      console.error('Error resetting config:', err);
    }
  }
}

// Clear logs
async function clearLogs() {
  if (confirm('Are you sure you want to clear all logs?')) {
    try {
      await chrome.storage.local.set({ logs: [] });
      document.getElementById('logViewer').innerHTML = '<div class="empty-state">No logs found</div>';
      showNotification('Logs cleared successfully!', 'success');
    } catch (err) {
      showNotification('Error clearing logs: ' + err.message, 'error');
      console.error('Error clearing logs:', err);
    }
  }
}

// Download logs as JSON
async function downloadLogs() {
  try {
    const { logs = [] } = await chrome.storage.local.get('logs');
    
    if (logs.length === 0) {
      showNotification('No logs to download', 'info');
      return;
    }
    
    // Format date for filename
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `shorts-remover-logs-${date}-${time}.json`;
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Logs downloaded successfully!', 'success');
  } catch (err) {
    showNotification('Error downloading logs: ' + err.message, 'error');
    console.error('Error downloading logs:', err);
  }
}

// Reset statistics
async function resetStats() {
  if (confirm('Are you sure you want to reset all statistics?')) {
    try {
      await new Promise(resolve => 
        chrome.runtime.sendMessage({ type: 'resetStats' }, resolve)
      );
      
      updateStatsDisplay({ totalRemoved: 0, lastCleanup: null });
      showNotification('Statistics reset successfully!', 'success');
    } catch (err) {
      showNotification('Error resetting statistics: ' + err.message, 'error');
      console.error('Error resetting stats:', err);
    }
  }
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
  // Check if notification container exists
  let container = document.querySelector('.notification-container');
  
  if (!container) {
    // Create container if it doesn't exist
    container = document.createElement('div');
    container.className = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = message;
  notification.style.cssText = `
    background-color: ${getNotificationColor(type)};
    color: white;
    padding: 12px 20px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: relative;
    min-width: 200px;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  
  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 10px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
  `;
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  
  notification.appendChild(closeBtn);
  container.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

function getNotificationColor(type) {
  switch (type) {
    case 'success': return '#4caf50';
    case 'error': return '#f44336';
    case 'warning': return '#ff9800';
    default: return '#2196f3'; // info
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Default config - defined for reset function
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
  customPatterns: [],
  redirectShortsPage: false,
  logging: true,
  logLevel: "info",
  showCounter: true,
  performance: {
    batchSize: 10,
    throttleMs: 100,
    maxItems: 200
  },
  stats: {
    totalRemoved: 0,
    lastCleanup: null
  }
};