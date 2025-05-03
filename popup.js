// popup.js
// ---------------------------

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch current config
  const resp = await chrome.runtime.sendMessage({ type: 'getConfig' });
  const config = resp.config || {};

  // Populate version
  document.getElementById('version').textContent = config.version || 'N/A';

  // Get toggles
  const enabledToggle  = document.getElementById('enabled');
  const redirectToggle = document.getElementById('redirect');
  const counterToggle  = document.getElementById('showCounter');

  // Initialize toggle states
  enabledToggle.checked  = !!config.enabled;
  redirectToggle.checked = !!config.redirectShortsPage;
  counterToggle.checked  = config.showCounter !== false;

  // Update on change
  enabledToggle.onchange  = saveConfig;
  redirectToggle.onchange = saveConfig;
  counterToggle.onchange  = saveConfig;

  // Display stats
  const totalRemovedEl = document.getElementById('totalRemoved');
  if (config.stats && typeof config.stats.totalRemoved === 'number') {
    totalRemovedEl.textContent = config.stats.totalRemoved.toLocaleString();
  } else {
    totalRemovedEl.textContent = '0';
  }

  // Show current tab hostname
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      document.getElementById('currentTab').textContent = url.hostname;
    }
  });

  // Button actions
  document.getElementById('openOptions').onclick = () => {
    chrome.runtime.openOptionsPage();
    window.close();
  };
  document.getElementById('refresh').onclick = () => {
    chrome.tabs.reload();
    window.close();
  };

  // Save updated config
  async function saveConfig() {
    const newConfig = {
      ...config,
      enabled: enabledToggle.checked,
      redirectShortsPage: redirectToggle.checked,
      showCounter: counterToggle.checked
    };
    await chrome.runtime.sendMessage({ type: 'setConfig', config: newConfig });
  }
});
