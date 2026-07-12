# Collate

Merge an unlimited number of PDFs in your browser. Files never leave your device.

**Live:** [https://immmune-etude.github.io/collate/](https://immmune-etude.github.io/collate/)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Use

1. Drop PDFs onto the page, or click **browse files**
2. Drag rows to reorder (merge order top → bottom)
3. Click **Merge** — the combined PDF downloads automatically

## Build

```bash
npm run build
npm run preview
```

## Deploy

```bash
npm run build
npx gh-pages -d dist
```

## Notes

- No file-count limit (only your device memory)
- Uses [pdf-lib](https://pdf-lib.js.org/) entirely client-side
- Encrypted PDFs may fail to merge depending on permissions
