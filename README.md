# GifVibes

A modern, browser-based video to GIF converter that works entirely in your browser. No files are uploaded to any server - all processing happens locally for your privacy and security.

<!-- Force Vercel to use latest commit with fixed dependencies -->

## ✨ Features

- **Modern UI**: Built with ShadCN design system components
- **Multiple Formats**: Supports MP4, MOV, AVI, WebM, and other video formats
- **Browser-Based**: All processing happens locally - no files uploaded to servers
- **Customizable**: Adjust FPS and quality settings
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready**: Built-in support for light/dark themes

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **Build Tool**: Turbopack

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:JoeAllison/video_to_gif_chadcn.git
   cd video_to_gif_chadcn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

This project uses **ShadCN UI**, a collection of beautifully designed, accessible components built on top of Tailwind CSS and Radix UI.

### Key Components Used

- **Button** - Primary actions and secondary buttons
- **Card** - Content containers with headers and descriptions
- **Input** - File input handling
- **Progress** - Conversion progress indicator
- **Slider** - FPS and quality controls

### Color Scheme

- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#f3f4f6)
- **Accent**: Light blue (#eff6ff)
- **Destructive**: Red (#ef4444)
- **Muted**: Subtle grays for secondary text

## 📱 Responsive Design

The interface is fully responsive and works across all device sizes:

- **Desktop**: Full-width layout with side-by-side controls
- **Tablet**: Optimized spacing and touch-friendly controls
- **Mobile**: Stacked layout with mobile-optimized interactions

## 🔧 Customization

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

### Modifying Themes

Edit `app/globals.css` to customize:
- Color schemes
- Border radius
- Spacing
- Typography

### Adding New Features

The modular component structure makes it easy to add new features:
- New conversion options
- Additional output formats
- Enhanced preview capabilities
- Batch processing

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms

- **Netlify**: Works with `npm run build`
- **GitHub Pages**: Requires static export
- **Traditional hosting**: Upload `out` folder after build

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ by GifVibes using Next.js and ShadCN UI
