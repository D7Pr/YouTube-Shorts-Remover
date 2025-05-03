// ---------------------------
// content.js
// ---------------------------
(async function() {
  let shortCounter = 0;
  let throttleTimer = null;
  let config = null;

  try {
    const response = await new Promise(res => 
      chrome.runtime.sendMessage({ type: 'getConfig' }, res)
    );
    config = response.config;
    
    if (!config.enabled) return;
    
    // Initialize counter badge if enabled
    if (config.showCounter) {
      createCounterBadge();
    }

    // Log page load
    chrome.runtime.sendMessage({ 
      type: 'log', 
      level: 'info', 
      text: `Shorts Remover active on: ${window.location.href}` 
    });

    // Handle shorts page redirect
    if (window.location.pathname.startsWith('/shorts') && config.redirectShortsPage) {
      chrome.runtime.sendMessage({ 
        type: 'log', 
        level: 'info', 
        text: 'Redirecting from Shorts page' 
      });
      window.location.replace('https://www.youtube.com');
      return;
    }

    // Initial cleaning
    const removed = await cleanPage();
    
    // Set up mutation observer with throttling
    observePage();
    
    // Update stats
    if (removed > 0) {
      updateStats(removed);
    }
  } catch (err) {
    console.error('Shorts Remover error:', err);
    chrome.runtime.sendMessage({ 
      type: 'log', 
      level: 'error', 
      text: `Error: ${err.message}` 
    });
  }

  function getAllPatterns() {
    return [...config.patterns, ...config.customPatterns].filter(p => p.trim());
  }
  
  async function cleanPage() {
    const allPatterns = getAllPatterns();
    let removedCount = 0;

    try {
      // Process in batches for better performance
      for (let i = 0; i < allPatterns.length; i += config.performance.batchSize) {
        const batch = allPatterns.slice(i, i + config.performance.batchSize);
        
        for (const selector of batch) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            chrome.runtime.sendMessage({ 
              type: 'log', 
              level: 'debug', 
              text: `Found ${elements.length} items matching: ${selector}` 
            });
            
            // Limit the number of items processed at once
            const itemsToProcess = Math.min(elements.length, config.performance.maxItems);
            for (let j = 0; j < itemsToProcess; j++) {
              elements[j].remove();
              removedCount++;
            }
          }
        }
        
        // Small delay between batches to avoid freezing the UI
        if (i + config.performance.batchSize < allPatterns.length) {
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
      
      if (removedCount > 0) {
        shortCounter += removedCount;
        updateCounterBadge();
        
        chrome.runtime.sendMessage({ 
          type: 'log', 
          level: 'info', 
          text: `Removed ${removedCount} shorts elements` 
        });
      }
      
      return removedCount;
    } catch (err) {
      chrome.runtime.sendMessage({ 
        type: 'log', 
        level: 'error', 
        text: `Cleaning error: ${err.message}` 
      });
      return 0;
    }
  }

  function observePage() {
    const observer = new MutationObserver((mutations) => {
      // Throttle to avoid performance issues
      if (!throttleTimer) {
        throttleTimer = setTimeout(async () => {
          const removed = await cleanPage();
          if (removed > 0) {
            updateStats(removed);
          }
          throttleTimer = null;
        }, config.performance.throttleMs);
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false
    });
    
    // Watch for URL changes (YouTube is a SPA)
    let lastUrl = location.href;
    setInterval(() => {
      if (lastUrl !== location.href) {
        lastUrl = location.href;
        chrome.runtime.sendMessage({ 
          type: 'log', 
          level: 'info', 
          text: `URL changed: ${location.href}` 
        });
        
        // Check for shorts redirect
        if (location.pathname.startsWith('/shorts') && config.redirectShortsPage) {
          chrome.runtime.sendMessage({ 
            type: 'log', 
            level: 'info', 
            text: 'Redirecting from Shorts after URL change' 
          });
          window.location.replace('https://www.youtube.com');
        } else {
          // Clean the new page
          setTimeout(cleanPage, 500);
        }
      }
    }, 1000);
  }
  
  function createCounterBadge() {
    const badge = document.createElement('div');
    badge.id = 'shorts-remover-counter';
    badge.innerHTML = '0';
    badge.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 5px 10px;
      border-radius: 12px;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.3s, transform 0.3s;
    `;
    badge.title = 'Shorts elements removed';
    
    badge.addEventListener('mouseover', () => {
      badge.style.opacity = '1';
      badge.style.transform = 'scale(1.1)';
    });
    
    badge.addEventListener('mouseout', () => {
      badge.style.opacity = '0.8';
      badge.style.transform = 'scale(1)';
    });
    
    badge.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'openPopup' });
    });
    
    document.body.appendChild(badge);
    
    // Hide after 5 seconds, show on hover
    setTimeout(() => {
      badge.style.opacity = '0.2';
    }, 5000);
  }
  
  function updateCounterBadge() {
    const badge = document.getElementById('shorts-remover-counter');
    if (badge) {
      badge.innerHTML = shortCounter.toString();
      badge.style.opacity = '0.8';
      
      // Animation effect
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, 200);
      
      // Auto-hide after a few seconds
      setTimeout(() => {
        badge.style.opacity = '0.2';
      }, 3000);
    }
  }
  
  async function updateStats(removedCount) {
    try {
      await chrome.runtime.sendMessage({ 
        type: 'updateStats', 
        count: removedCount 
      });
    } catch (err) {
      console.error('Error updating stats:', err);
    }
  }
})();