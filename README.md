# PowerPoint Merger

A 100% client-side, purely browser-based React application that merges multiple PowerPoint (.pptx) files without any server-side processing.

## Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v3
- **PPTX Manipulation:** JSZip (direct ZIP manipulation of OpenXML architecture)
- **Deployment:** Static Build (ready for Vercel, Netlify, GitHub Pages)

## How It Works
Instead of using server-side binaries or slow rendering canvases, this app treats `.pptx` files as OpenXML ZIP archives. It directly parses, manipulates, deduplicates, and restructures the XML manifests (`[Content_Types].xml`, `presentation.xml`, `.rels`) alongside copying slide layouts, themes, media, and masters from source presentations into a single merged blob entirely in the browser.

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run local dev server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
   *The static files will be placed in the `dist` directory.*

## One-Click Deploy to Vercel/Netlify

**Vercel:**
1. Push this repository to GitHub.
2. Log into Vercel and click "Add New Project".
3. Select your repository. Vercel will automatically detect Vite.
4. Click **Deploy**.

**Netlify:**
1. Push this repository to GitHub.
2. Log into Netlify and click "Add new site" -> "Import an existing project".
3. Connect your GitHub and select the repo.
4. Build command: `npm run build`, Publish directory: `dist`.
5. Click **Deploy site**.

## Features
- Drag-and-drop file upload queue
- Re-order files to control merged sequence
- Select specific slides to include (e.g., "1-3, 5")
- Retains full vector fidelity, animations, and layouts
- No file size limits other than local browser memory
- 100% private, files never leave the user's device
