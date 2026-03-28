# Premium Slideshow Application

A high-performance, Apple-inspired slideshow application built with React, Vite, and modern web technologies.

## ✨ Features

- **Smooth Animations**: Spring-physics based transitions using Framer Motion
- **Dark/Light Mode**: True OLED dark mode (#000000) and Apple gray light mode (#F5F5F7)
- **Glassmorphism UI**: Modern frosted glass effects with backdrop blur
- **Keyboard Navigation**: Arrow keys to navigate, F for fullscreen
- **Responsive Design**: Works beautifully on mobile, tablet, and desktop
- **Fullscreen Mode**: Immersive presentation experience
- **Progress Indicator**: Visual progress bar and slide counter

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## ☁️ Deploy to Cloudflare

This project is already configured for Cloudflare Workers static assets deployment via `wrangler.jsonc`.

### 1) One-time setup

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login
```

### 2) Build locally

```bash
npm run build
```

### 3) Deploy

```bash
npm run deploy
```

This runs `wrangler deploy` and uploads your built `dist` assets.

### 4) Optional: preview locally with Cloudflare runtime

```bash
npm run preview
```

### 5) Git-based Cloudflare Pages deployment (alternative)

If you prefer deploying through Cloudflare Pages UI using your GitHub repo:

- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20`

`_redirects` is included for SPA fallback (`/* /index.html 200`).

### Notes

- Static security headers are provided in `_headers`.
- `wrangler.jsonc` includes SPA not-found handling via `assets.not_found_handling = "single-page-application"`.

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `↑` | Previous slide |
| `→` / `↓` / `Space` | Next slide |
| `F` | Toggle fullscreen |
| `Esc` | Exit fullscreen |

## 📁 Project Structure

```
slideshow-app/
├── src/
│   ├── components/
│   │   ├── Slide.jsx          # Slide with animations
│   │   ├── Controls.jsx       # Navigation controls
│   │   ├── ProgressBar.jsx    # Progress indicator
│   │   └── ThemeToggle.jsx    # Dark/light mode toggle
│   ├── hooks/
│   │   └── useKeyboard.js     # Keyboard navigation hook
│   ├── data/
│   │   └── slides.json        # Slide content data
│   ├── App.jsx                # Main application
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Customization

### Adding Slides

Edit `src/data/slides.json` to add or modify slides:

```json
[
  {
    "id": 1,
    "title": "Your Title",
    "content": "Your description here",
    "image": "https://your-image-url.jpg"
  }
]
```

### Styling

The app uses Tailwind CSS v4 with custom configuration:

- **Dark mode**: `#000000` background
- **Light mode**: `#F5F5F7` background (Apple Gray)
- **Glassmorphism**: `.glass` utility class
- **System fonts**: Apple system font stack

### Animation Settings

Modify spring physics in `src/components/Slide.jsx`:

```javascript
const transition = {
  type: 'spring',
  stiffness: 300,  // Higher = faster
  damping: 30,     // Higher = less bounce
  mass: 1,
};
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool
- **Tailwind CSS v4** - Utility-first CSS
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## 🎯 Performance

- Optimized bundle size (~325KB JS, ~16KB CSS)
- Lazy loading images
- Hardware-accelerated animations
- Smooth 60fps transitions

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Design inspired by Apple's aesthetic principles
- Unsplash for beautiful placeholder images
- Framer Motion for amazing animation capabilities