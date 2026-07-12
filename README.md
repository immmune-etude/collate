# Collate

Merge an unlimited number of PDFs in your browser. Files never leave your device.

## Run

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

## Notes

- No file-count limit (only your device memory)
- Uses [pdf-lib](https://pdf-lib.js.org/) entirely client-side
- Encrypted PDFs may fail to merge depending on permissions
