# 🚀 Mohamad Moallem - Modern Portfolio Website

A modern, responsive personal portfolio website built with React, Vite, Tailwind CSS, and Framer Motion.

## ✨ Features

- ⚡ **Lightning Fast**: Built with Vite for optimal performance
- 🎨 **Beautiful Design**: Modern, clean, and professional UI with smooth animations
- 📱 **Fully Responsive**: Mobile-first design that works on all devices
- 🌙 **Dark Theme**: Eye-friendly dark mode by default
- ✨ **Smooth Animations**: Framer Motion animations for engaging interactions
- 🎯 **SEO Ready**: Optimized for search engines
- 📧 **Contact Form**: Integrated with Formspree for easy messaging
- 📄 **Resume Download**: Easy resume access
- 🎲 **Dynamic Content**: Data-driven components using JSON

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion 10
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📁 Project Structure: View FILE_STRUCTURE_OVERVIEW.txt

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. **Clone or navigate to the project**
```bash
cd portfolio
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start development server**
```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## 📝 Customization Guide

### Update Information

Edit `src/data/portfolioData.js`

### Customize Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#0f172a',    // Main background
      secondary: '#1e293b',  // Secondary background
      accent: '#3b82f6',     // Accent color
    },
  },
}
```

### Update Resume

1. Replace current resume PDF in the `public/` folder with the newest one.

## 🌐 Deployment(options)

### Deploy on Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

2. **Connect to Vercel**
- Go to [Vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "New Project"
- Select your portfolio repository
- Click "Deploy"

### Deploy on GitHub Pages

1. **Update `vite.config.js`**
```javascript
export default defineConfig({
  base: '/portfolio/', // Replace with your repo name if needed
  plugins: [react()],
})
```

2. **Add build script to `package.json`**
```json
"deploy": "npm run build && gh-pages -d dist"
```

3. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

4. **Deploy**
```bash
npm run deploy
```

### Deploy on Netlify

1. **Build the project**
```bash
npm run build
```

2. **Go to [Netlify.com](https://netlify.com)**
- Drag and drop the `dist` folder
- Or connect your GitHub repository

## 📧 Contact Form Setup

### Using Formspree (Free & Easy)

1. Visit [formspree.io](https://formspree.io)
2. Sign up for free
3. Create a new form
4. Copy your form ID
5. Update `Contact.jsx`:
```javascript
const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
```

## 🎨 Customization Tips

### Add More Sections
1. Create a new component in `src/components/`
2. Import and add to `app.jsx`
3. Add navigation link in `Navbar.jsx`

### Change Animations
Edit Framer Motion properties in components:
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>
```

### Add Dark/Light Mode Toggle
See `tailwind.config.js` - already supports dark mode with `darkMode: 'class'`

## 🔍 SEO Optimization

The portfolio is already optimized for SEO:
- Semantic HTML
- Meta descriptions in `index.html`
- Open Graph tags ready to add
- Fast performance (Vite)

Add more meta tags in `index.html`:
```html
<meta property="og:title" content="Your Name - Portfolio" />
<meta property="og:description" content="Your description" />
<meta property="og:image" content="https://yourimage.jpg" />
```

## 📱 Mobile Optimization

The site is fully responsive and mobile-friendly with:
- Responsive grid layouts
- Mobile-first design
- Touch-friendly buttons
- Optimized images

## 🚀 Build & Preview

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance

- **Vite**: Ultra-fast build times
- **Code Splitting**: Automatic by Vite
- **Image Optimization**: Use optimized images
- **Lazy Loading**: Images load on demand
- **Lighthouse Score**: Target 90+

## 🤝 Contributing

Feel free to customize and make this portfolio your own!

## 📜 License

MIT License - Feel free to use this template for your portfolio.

## 🆘 Troubleshooting

### Form not working?
- Check your Formspree form ID
- Verify endpoint URL is correct
- Check browser console for errors

### Animations not smooth?
- Ensure Framer Motion is installed
- Check browser hardware acceleration is enabled
- Test on a faster device if needed

### Styling issues?
- Run `npm install` to ensure all packages are installed
- Clear `.vite` cache folder
- Restart development server

For questions or updates, check the documentation of:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
