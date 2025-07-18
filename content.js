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

  // Helper function to verify if an element is likely a shorts element
  function isLikelyShorts(element) {
    if (!element) return false;
    
    // Check for shorts-related keywords in various attributes
    const shortsKeywords = ['shorts', 'reel', '#shorts'];
    const attributesToCheck = ['href', 'aria-label', 'title', 'class', 'id'];
    
    for (const attr of attributesToCheck) {
      const value = element.getAttribute(attr);
      if (value) {
        const lowerValue = value.toLowerCase();
        if (shortsKeywords.some(keyword => lowerValue.includes(keyword))) {
          return true;
        }
      }
    }
    
    // Check text content for shorts indicators
    const textContent = element.textContent?.toLowerCase() || '';
    if (shortsKeywords.some(keyword => textContent.includes(keyword))) {
      return true;
    }
    
    // Check for shorts URLs in child elements
    const links = element.querySelectorAll('a[href*="/shorts/"]');
    if (links.length > 0) {
      return true;
    }
    
    // Check parent elements for shorts context
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 3) {
      const parentClass = parent.className?.toLowerCase() || '';
      const parentId = parent.id?.toLowerCase() || '';
      if (shortsKeywords.some(keyword => parentClass.includes(keyword) || parentId.includes(keyword))) {
        return true;
      }
      parent = parent.parentElement;
      depth++;
    }
    
    return false;
  }
  
  async function cleanPage() {
    const allPatterns = getAllPatterns();
    let removedCount = 0;
    const startTime = performance.now();

    try {
      // Process in batches for better performance with time-based limits
      for (let i = 0; i < allPatterns.length; i += config.performance.batchSize) {
        const batch = allPatterns.slice(i, i + config.performance.batchSize);
        const batchStartTime = performance.now();
        
        for (const selector of batch) {
          try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              chrome.runtime.sendMessage({ 
                type: 'log', 
                level: 'debug', 
                text: `Found ${elements.length} items matching: ${selector}` 
              });
              
              // Process items with improved limits
              const itemsToProcess = Math.min(elements.length, config.performance.maxItems);
              let processedInBatch = 0;
              
              for (let j = 0; j < itemsToProcess; j++) {
                if (elements[j] && elements[j].parentNode) {
                  // Check if element is actually a shorts-related element
                  if (isLikelyShorts(elements[j])) {
                    elements[j].remove();
                    removedCount++;
                    processedInBatch++;
                  }
                }
                
                // Check if we've exceeded batch time limit
                if (performance.now() - batchStartTime > config.performance.maxBatchTime) {
                  chrome.runtime.sendMessage({ 
                    type: 'log', 
                    level: 'debug', 
                    text: `Batch time limit reached, processed ${processedInBatch} items` 
                  });
                  break;
                }
              }
            }
          } catch (selectorError) {
            chrome.runtime.sendMessage({ 
              type: 'log', 
              level: 'warn', 
              text: `Selector error for '${selector}': ${selectorError.message}` 
            });
          }
        }
        
        // Small delay between batches to avoid freezing the UI
        if (i + config.performance.batchSize < allPatterns.length) {
          await new Promise(resolve => setTimeout(resolve, 2));
        }
      }
      
      if (removedCount > 0) {
        shortCounter += removedCount;
        updateCounterBadge();
        
        const duration = performance.now() - startTime;
        chrome.runtime.sendMessage({ 
          type: 'log', 
          level: 'info', 
          text: `Removed ${removedCount} shorts elements in ${duration.toFixed(2)}ms` 
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
      // Format large numbers appropriately
      let displayText = shortCounter.toString();
      if (shortCounter >= 1000000) {
        displayText = (shortCounter / 1000000).toFixed(1) + 'M';
      } else if (shortCounter >= 1000) {
        displayText = (shortCounter / 1000).toFixed(1) + 'K';
      }
      
      badge.innerHTML = displayText;
      badge.style.opacity = '0.8';
      
      // Animation effect with better visibility for large numbers
      badge.style.transform = 'scale(1.2)';
      badge.style.background = shortCounter > 500 ? '#ff5722' : '#f44336';
      
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, 200);
      
      // Auto-hide after a few seconds
      setTimeout(() => {
        badge.style.opacity = '0.2';
      }, 3000);
      
      // Update title to show exact count
      badge.title = `${shortCounter} shorts elements removed`;
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