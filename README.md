# 🗞️ The Fold: Daily Dispatch 📰

> "All the News That's Fit to Feed"

Welcome to **The Fold**, a premium, vintage-inspired news aggregator that brings the elegance of 19th-century journalism to your modern mobile device. Built with the **Ionic Vue** framework and powered by real-time RSS feeds, The Fold is designed for those who appreciate the weight of words and the aesthetic of the printed page.

---

## 🏛️ Heritage & Vision
In an era of fleeting digital fragments, The Fold restores the gravitas of news. Every dispatch is delivered on digital parchment, styled with classic serif typography and presented with the dignity of a daily broadsheet.

## ✨ Features

- **📜 Vintage News Feed**: A curated stream of dispatches from global and local wires, styled as a classic newspaper with authentic **Gutenberg-era** typography.
- **🖼️ Visual Archive**: Fullscreen image previews with sepia-toned filters to preserve the heritage aesthetic.
- **📍 Localized Masthead**: Dynamic weather and location tracking, updating your "Daily Edition" details based on your current coordinates.
- **📚 Personal Collection**: A private library for your "Saved" and "Liked" articles, ensuring no important dispatch is ever lost to the archives.
- **📡 Wire Configuration**: Full control over your news sources. Select the wires you wish to follow and customize your feed.
- **✨ Authentic Typography**: Features a refined selection of historic typefaces including *Old Standard TT*, *Playfair Display*, *EB Garamond*, and the blackletter *UnifrakturMaguntia*.
- **⚡ Modern Performance**:

  - **Caching & Offline Support**: Stay informed even when the telegraph lines are down.
  - **Lazy Loading**: Smooth, continuous scrolling through endless archives.
  - **Pull-to-Refresh**: Retrieve the latest dispatches with a simple gesture.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Ionic Vue](https://ionicframework.com/docs/vue/overview) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Native Bridge** | [Capacitor](https://capacitorjs.com/) |
| **Styling** | Vanilla CSS with Vintage Theming |
| **Icons** | [Ionicons](https://ionicons.com/) |

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS)
- [Ionic CLI](https://ionicframework.com/docs/intro/cli)

### Installation

1. **Clone the Dispatch**:
   ```bash
   git clone <repository-url>
   cd news-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Ignite the Printing Press**:
   ```bash
   npm run dev
   ```

### Mobile Deployment
Deploy to Android or iOS using Capacitor:
```bash
npx cap add android
npx cap copy
npx cap open android
```

## 📂 Directory Structure

- `src/views/`: The primary sections of the paper (Tabs 1-4, Onboarding).
- `src/theme/`: The vintage design tokens and CSS variables.
- `src/components/`: Reusable UI elements keeping the masthead and articles consistent.
- `public/`: Assets including textures and fonts that give the app its parchment feel.

## 📜 Credits
Dedicated to the golden age of journalism. All news is fetched via public RSS feeds through a CORS proxy for seamless delivery.

---

*© 2026 The Fold Publication Group. Established for the Curious.*
