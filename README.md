# Smart Tab Grouper

A sleek and powerful Chrome extension that automatically groups tabs by hostname, keeping your browser organized and efficient.

![Smart Tab Grouper](https://img.shields.io/badge/Chrome-Extension-blue?style=flat-square&logo=google-chrome)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

## ✨ Features

### 🚀 **Auto-Grouping**
- Automatically groups new tabs by hostname as you browse
- Smart per-window grouping - tabs from the same site stay together in each window
- No duplicate groups - reuses existing groups intelligently

### 🎯 **Manual Controls**
- **Group All Tabs**: Organize all open tabs by hostname
- **Group New Tabs**: Only group tabs that aren't already in a group
- **Ungroup All**: Remove all tab groups with one click

### ⌨️ **Keyboard Shortcuts**
- `Cmd+Shift+H` / `Ctrl+Shift+H` - Group all tabs
- `Cmd+Shift+U` / `Ctrl+Shift+U` - Ungroup all tabs
- `Cmd+Shift+T` / `Ctrl+Shift+T` - Group ungrouped tabs

### ⚙️ **Customizable Settings**
- **Auto Group**: Toggle automatic grouping on/off
- **Smart Colors**: Enable intelligent color assignment for groups
- **Collapse by Default**: Set new groups to collapse automatically

### 📊 **Live Statistics**
- Real-time tab organization stats in the popup
- Total tabs, grouped count, ungrouped count, and total groups
- Updates every second while popup is open

## 🎨 **Modern UI**
- Beautiful gradient design with glassmorphism effects
- Compact and responsive popup interface
- Smooth animations and hover effects
- Dark theme optimized for modern browsers

## 📦 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "Smart Tab Grouper"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `smart-tab-grouper` folder
5. The extension will be installed and ready to use!

## 🚀 Usage

### Basic Usage
1. Install the extension
2. Open some tabs from different websites
3. Click the extension icon or use `Cmd+Shift+H` to group all tabs
4. Tabs will be automatically organized by hostname

### Advanced Usage
- **Auto-grouping**: Enable in settings for automatic organization as you browse
- **Manual grouping**: Use the popup buttons for specific control
- **Keyboard shortcuts**: Quick actions without opening the popup
- **Per-window groups**: Each browser window maintains its own groups

## 🔧 Configuration

Access settings through the extension popup:

### Auto Group
- **On**: Automatically group new tabs as they're created
- **Off**: Manual grouping only

### Smart Colors
- **On**: Assign colors intelligently to different hostnames
- **Off**: Use default Chrome group colors

### Collapse by Default
- **On**: New groups start collapsed
- **Off**: New groups start expanded

## 📸 Screenshots

### Extension Popup
![Popup Interface](https://via.placeholder.com/280x400/667eea/ffffff?text=Smart+Tab+Grouper+Popup)

### Tab Groups in Action
![Grouped Tabs](https://via.placeholder.com/800x200/764ba2/ffffff?text=Organized+Tab+Groups)

## 🛠️ Development

### Prerequisites
- Chrome browser
- Basic knowledge of JavaScript and Chrome extensions

### Project Structure
```
smart-tab-grouper/
├── manifest.json          # Extension manifest
├── background/
│   └── background.js      # Core logic and event handlers
├── popup/
│   ├── popup.html         # Extension popup UI
│   └── popup.js          # Popup functionality
├── icons/                 # Extension icons
└── README.md             # This file
```

### Building and Testing
1. Clone the repository
2. Make your changes
3. Load as unpacked extension in Chrome
4. Test functionality
5. Submit a pull request

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern Chrome Extension Manifest V3
- Inspired by the need for better tab organization
- Thanks to the Chrome Extensions community

## 📞 Support

If you have any questions or issues:
- Open an issue on GitHub
- Check the troubleshooting section below

### Troubleshooting

**Extension not working?**
- Make sure you're using Chrome
- Check that the extension is enabled in `chrome://extensions/`
- Try reloading the extension

**Keyboard shortcuts not working?**
- Check that no other extensions are using the same shortcuts
- Go to `chrome://extensions/shortcuts` to customize

**Auto-grouping not working?**
- Ensure "Auto Group" is enabled in settings
- Check that tabs have valid URLs (not chrome:// pages)

---

**Made with ❤️ for better browser organization**
