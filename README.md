# The Vibe Coding Era — Presentation App

A high-performance, Apple-inspired slideshow application built with React 19, Vite 8, and TypeScript. Designed to deliver the *"The Vibe Coding Era: From Coder to Pilot"* presentation.

## ✨ Features

- **Progressive Reveal System**: Each slide's stats, bullet points, images, and callouts animate in step-by-step on click or keypress
- **Dark/Light Mode**: True OLED dark mode (`#080B14`) and Apple gray light mode (`#F5F5F7`) with localStorage persistence and system preference detection
- **Glassmorphism UI**: Modern frosted glass effects with backdrop blur and ambient glow orbs per section color
- **Section Navigation**: Jump directly to any of the 5 presentation sections via the header nav bar
- **Title Slide**: Animated intro with speaker name, designation, tagline, and section overview
- **Final Resources Page**: QR code card grid (Slides, LinkedIn, Cline Bot, Warp CLI) after the last slide
- **Image Modal**: Click any slide image or press `.` to view it fullscreen
- **Keyboard Navigation**: Full keyboard support for navigation and reveal
- **Browser Fullscreen**: Toggle native browser fullscreen from the UI or with keyboard
- **Responsive Design**: Works on mobile, tablet, and desktop
- **TypeScript**: Fully typed codebase with shared type definitions

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

# Preview production build (uses Wrangler locally)
npm run preview
```

The app will be available at `http://localhost:5173`

## ☁️ Deploy to Cloudflare

This project is configured for Cloudflare Workers static assets deployment via `wrangler.jsonc`.

### ✅ Latest deployment status

- Successfully deployed with Wrangler
- Live URL: `https://vibe-coding-presentation.vishnuraj910.workers.dev`
- Current Version ID: `aebbef2d-d4ac-4416-b9a8-fd533fc16764`

You can redeploy anytime with `npm run deploy`.

### 1) One-time setup

```bash
npm install
npx wrangler login
```

### 2) Build & Deploy

```bash
npm run build
npm run deploy
```

This runs `wrangler deploy` and uploads the built `dist` assets.

### 3) Optional: Cloudflare Pages (Git-based)

If you prefer deploying through the Cloudflare Pages UI using your GitHub repo:

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: `20`

### Notes

- `_redirects` handles SPA fallback (`/* /index.html 200`)
- `_headers` provides static security headers
- `wrangler.jsonc` uses `assets.not_found_handling = "single-page-application"` for SPA routing
- `@cloudflare/vite-plugin` is enabled in `vite.config.js`

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `↓` / `Space` / `PageDown` | Reveal next item or advance to next slide |
| `←` / `↑` / `PageUp` | Step back (un-reveal or go to previous slide) |
| `.` | Open current slide's image in fullscreen |
| `Esc` | Close image modal |
| `Enter` | Start presentation from title screen |

## 📁 Project Structure

```
slideshow-app/
├── public/
│   ├── assets/               # Static images and QR codes
│   │   ├── ai_adoption.jpg
│   │   ├── qr-cline.png
│   │   ├── qr-code.png
│   │   ├── qr-slides.png
│   │   └── qr-warp.png
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── FinalPage.tsx      # Resources page with QR code card grid
│   │   ├── ThemeToggle.tsx    # Animated dark/light mode toggle button
│   │   ├── Slide.jsx          # Legacy slide component (Framer Motion)
│   │   ├── Controls.jsx       # Navigation controls
│   │   └── ProgressBar.jsx    # Progress indicator
│   ├── context/
│   │   └── ThemeContext.tsx   # React context for theme state + localStorage
│   ├── hooks/
│   │   └── useKeyboard.js     # Keyboard navigation hook
│   ├── types/
│   │   └── slides.ts          # TypeScript types for all data structures
│   ├── data/
│   │   └── slides.json        # Full presentation content (5 sections, 24 slides)
│   ├── App.tsx                # Main application (title slide, section nav, reveal engine)
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
├── wrangler.jsonc
├── _headers                   # Cloudflare security headers
└── _redirects                 # SPA routing fallback
```

## 🎨 Presentation Content

**"The Vibe Coding Era: From Coder to Pilot"** — 24 slides across 5 sections:

| Section | Icon | Slides | Topics |
|---------|------|--------|--------|
| The Shift | ⚡ | 6 | AI adoption, agent metaphor, model selection |
| The Craft | 🧠 | 8 | Prompt architecture, context management, TDD, guardrails |
| The Build | 🚀 | 7 | Brainstorm → architecture → git → deploy pipeline |
| The Mindset | 🎯 | 4 | Local LLMs, toolbox, architect identity, continuous learning |
| Conclusion | 🤝 | 1 | Thank you + LinkedIn |

## 🧩 Slide Data Structure

Edit `src/data/slides.json` to modify the presentation:

```json
{
  "presentation_title": "The Vibe Coding Era",
  "presentation_subtitle": "From Coder to Pilot",
  "tagline": "Stop writing code. Start steering intent.",
  "version": "2026 Edition",
  "into_speaker": {
    "name": "Your Name",
    "designation": "Your Role"
  },
  "sections": [
    {
      "section_name": "Section Name",
      "section_icon": "⚡",
      "section_color": "#6C63FF",
      "slides": [
        {
          "slide_number": 1,
          "heading": "Slide Title",
          "subheading": "Italic subtitle shown below the heading",
          "points": ["Bullet point one", "Bullet point two"],
          "stat": { "value": "4×", "label": "description", "source": "Source, Year" },
          "callout": "The highlighted quote shown at the bottom",
          "image": "/assets/your-image.jpg",
          "linkedinUrl": "https://linkedin.com/in/yourprofile"
        }
      ]
    }
  ],
  "final": {
    "heading": "Resources",
    "subheading": "A subtitle for the final page",
    "cards": [
      { "title": "Slides", "image": "/assets/qr-slides.png" }
    ]
  }
}
```

All fields except `slide_number`, `heading`, and `subheading` are optional.

## 🎨 Theming

The app uses a `ThemeContext` with two palettes:

| Token | Dark | Light |
|-------|------|-------|
| `bg` | `#080B14` | `#F5F5F7` |
| `text` | `#ffffff` | `#1d1d1f` |
| `glassBg` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.7)` |

Theme preference is persisted to `localStorage` and respects `prefers-color-scheme` on first visit.

## 🛠️ Tech Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI library |
| **Vite** | 8 | Build tool |
| **TypeScript** | via tsconfig | Type safety |
| **Tailwind CSS** | v4 | Utility-first CSS (via `@tailwindcss/vite`) |
| **Framer Motion** | 12 | Spring animations & transitions |
| **Lucide React** | 1.0 | Icons (Sun, Moon) |
| **Wrangler** | 4 | Cloudflare deployment |

## 📱 Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## 🎯 Performance

- Optimized bundle via Vite 8
- Hardware-accelerated CSS transitions
- Smooth 60fps reveal animations
- No layout thrash — all animations use `opacity` and `transform`

## 📄 License

MIT License — free for personal and commercial use.

## 🙏 Acknowledgments

- Design inspired by Apple's aesthetic principles
- Framer Motion for spring-physics animation capabilities
- Cloudflare Workers for zero-config edge deployment
