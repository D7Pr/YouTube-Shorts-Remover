# 🚫 YouTube Shorts Remover (Chrome Extension)

Hide YouTube Shorts from your feed, search results, sidebar, and related videos — for a cleaner and more focused YouTube experience.

---

## ✨ Features

- 🔥 Removes Shorts from:
  - Home feed (`ytd-rich-shelf-renderer`)
  - Sidebar tab
  - Related video sections
  - Channel pages
  - Search results
- ⚙️ Custom CSS selector support via Options page
- 🔄 Optional redirect from `/shorts/*` to the homepage
- 🪵 Built-in structured logging system (view, download, clear)
- 🧠 Flexible config stored in `chrome.storage.sync`
- 💡 Manifest V3 + modular architecture
- 💻 Simple and modern user interface (popup & options page)

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

- 📋 Manage built-in and custom CSS selectors
- 📄 View, download, or clear logs
- 💾 Save settings with one click

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
