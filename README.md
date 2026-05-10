<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/512px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png" alt="PowerPoint Logo" width="80" />
  <h1>Client-Side PowerPoint Merger</h1>
  <p>A lightning-fast, 100% pure client-side web application to merge multiple <code>.pptx</code> files securely in your browser.</p>
</div>

---

## ⚡ Features

- **Zero Server Compute:** Everything runs entirely inside your browser using JavaScript and HTML5. No files are ever uploaded to a server, ensuring absolute privacy and zero compute costs.
- **Direct ZIP Manipulation:** Instead of relying on slow Canvas rendering or server-side binaries, this app cracks open the OpenXML (`.pptx`) archives using `JSZip` and natively restructures the XML manifests.
- **100% Fidelity Maintained:** Because it copies the raw XML parts, your original vector shapes, embedded fonts, slide layouts, masters, and animations are preserved flawlessly.
- **Drag-and-Drop Queue:** Powered by `@dnd-kit`, allowing you to intuitively upload, re-order, and organize your presentations before merging.
- **Slide Range Selector:** Only need specific slides? Select slide ranges (e.g., `1-3, 5, 8-10`) per file, and the merger will extract precisely what you need.
- **Optimized Memory Profiling:** Designed to handle massive PowerPoint files with heavy embedded videos/images by streaming data via native browser `Blob` storage, preventing V8 heap memory crashes.

## 🛠️ Technology Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **PPTX Engine:** JSZip (OpenXML Parsing)
- **Drag & Drop:** dnd-kit
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pptx-merger.git
   cd pptx-merger
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local Vite server:**
   ```bash
   npm run dev
   ```
   The app will launch at `http://localhost:5173`.

### Building for Production

To generate a static build optimized for production:
```bash
npm run build
```
The compiled static site will be output to the `/dist` directory.

---

## ☁️ Deployment

Because this app uses zero server-side logic, it is incredibly easy to host for free on any static hosting provider.

### Deploy to Vercel
1. Push this repository to your GitHub account.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository. Vercel will automatically detect the Vite framework and configure the build settings.
4. Click **Deploy**.

### Deploy to Netlify
1. Push this repository to your GitHub account.
2. Log into [Netlify](https://netlify.com/) and click **Add new site** -> **Import an existing project**.
3. Connect your GitHub account and select the repository.
4. Set the Build Command to `npm run build` and the Publish Directory to `dist`.
5. Click **Deploy Site**.

---

## 🧠 How the Core Engine Works

Microsoft PowerPoint (`.pptx`) files are essentially renamed ZIP archives containing structured XML files. This application:
1. **Unzips** the base presentation to access the `[Content_Types].xml` manifest and relationships file.
2. **Scans** incoming presentations sequentially.
3. **Copies & Deduplicates** the requested slide XML files, remapping and renaming embedded images, videos, slide masters, and layouts to avoid file collisions (e.g. converting `image1.png` into `f2_media_1.png`).
4. **Restructures** the relationship IDs (`rId`) and appending new slides to the base `<p:sldIdLst>`.
5. **Re-Zips** the modified package and pushes a native Blob to the browser for instant download.

---

## 🛡️ Security

This project comes locked down by default:
- **Strict MIME Validation:** Prevents uploading malicious executables disguised as `.pptx` files.
- **Content-Security-Policy (CSP):** Employs strict CSP meta headers to prevent Cross-Site Scripting (XSS) and guarantee data never leaves the client browser.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
