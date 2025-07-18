# 🚫 YouTube Shorts Remover (Chrome Extension)

Hide YouTube Shorts from your feed, search results, sidebar, and related videos — for a cleaner and more focused YouTube experience.

---

## ✨ Features

- 🔥 **Advanced Shorts Removal** from:
  - Home feed (`ytd-rich-shelf-renderer`)
  - Sidebar tab
  - Related video sections
  - Channel pages
  - Search results
  - And many more locations with 28+ detection patterns
- ⚡ **High-Performance Processing**: Handles 1000+ shorts per cycle (upgraded from 200)
- ⚙️ **Customizable Performance Settings**: Adjust batch sizes, throttling, and processing limits
- 🎯 **Smart Detection**: Advanced element verification to ensure only Shorts are removed
- 🔄 Optional redirect from `/shorts/*` to the homepage
- 📊 **Enhanced Statistics**: Track removal counts with smart formatting (K/M notation)
- 🪵 Built-in structured logging system (view, download, clear)
- 🧠 Flexible config stored in `chrome.storage.sync`
- 💡 Manifest V3 + modular architecture
- 💻 Modern and responsive user interface (popup & options page)
- 🎨 **Visual Counter Badge**: On-page counter with smart formatting for large numbers

---

## 📦 Installation

### ✅ Option 1: Manual Installation (Development/Test)

1. Download or clone the repo:
   ```bash
   git clone https://github.com/D7Pr/YouTubeShortsRemove-Extenstion.git
   ```
2. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode** in the top-right corner.
4. Click **“Load unpacked”** and select the folder you just cloned.
5. You're done! 🎉

### 🚀 Option 2: Chrome Web Store *(Coming Soon)*

> The extension will be available on the Chrome Web Store shortly. Stay tuned!

---

## 🛠 Configuration & Usage

### ✅ Popup Menu

- ✅ Enable/disable Shorts Remover
- 🔁 Toggle redirect from `/shorts/*` pages
- ⚙️ Open the full options page

### ⚙️ Options Page

- 📋 Manage built-in and custom CSS selectors (28+ patterns included)
- ⚡ **Performance Settings**: Fine-tune batch sizes, processing limits, and timing
- 📄 View, download, or clear logs
- 📊 Statistics with smart number formatting
- 💾 Save settings with one click

### 🎛️ Performance Configuration

- **Batch Size**: Control how many elements are processed per batch (5-50)
- **Max Items**: Set maximum shorts to remove per cycle (100-5000, default: 1000)
- **Throttle Delay**: Adjust scanning frequency (10-500ms, default: 50ms)
- **Batch Time Limit**: Prevent page freezing with time limits (50-1000ms, default: 100ms)

---

## 🗃 Project Structure

```
youtube-shorts-remover/
├── background.js         # Chrome service worker
├── content.js            # Core logic to remove Shorts elements
├── popup.html/js         # Quick access controls
├── options.html/js       # Settings, logs, custom selectors
├── config.js             # Default configuration and patterns
├── manifest.json         # Manifest V3 configuration
└── icons/                # Extension icons
```

---

## 🆕 Version 2.2.0 Improvements

### 🚀 Performance Enhancements
- **5x Increased Processing Capacity**: Now handles up to 1000 shorts per cycle (vs 200 previously)
- **Optimized Batch Processing**: Smarter batching with configurable sizes (5-50 elements)
- **Time-Based Limits**: Prevents UI freezing with configurable batch time limits
- **Reduced Throttling**: Faster response times with 50ms default throttling (vs 100ms)

### 🎯 Enhanced Detection
- **28+ Detection Patterns**: Comprehensive coverage of YouTube Shorts elements
- **Smart Element Verification**: Advanced `isLikelyShorts()` function prevents false positives
- **Future-Proof Selectors**: Added patterns for new YouTube component formats

### 📊 Better User Experience
- **Smart Number Formatting**: Counter displays 1.5K, 2.3M instead of long numbers
- **Performance Settings UI**: Full control over processing parameters
- **Enhanced Statistics**: Better tracking and display of removal statistics
- **Improved Error Handling**: More robust error handling and logging

---

## 🧩 Customization

Want to hide more than just Shorts?  
Add your own CSS selectors in the **Options** page under **Custom Selectors**.  
One per line. Example:

```
#sponsored,
.ad-container,
div.ytp-ad-module
```

---

## 📄 License

This project is licensed under the MIT License.  
See [`LICENSE`](LICENSE) for details.

---

## 🤝 Contributing

Pull requests are welcome!  
If you have suggestions for improving the detection, UI/UX, or features, feel free to open an issue or PR.

---

## 🙌 Credits

Developed with ❤️ Fully using (AI) hahaha to help users stay focused and clean up their YouTube experience.

---

**GitHub Repo:** [https://github.com/D7Pr/YouTubeShortsRemove-Extenstion](https://github.com/D7Pr/YouTubeShortsRemove-Extenstion)
