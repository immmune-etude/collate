import { PDFDocument } from 'pdf-lib'

export type PdfMeta = {
  id: string
  file: File
  name: string
  size: number
  pageCount: number | null
  error?: string
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  return doc.getPageCount()
}

export async function mergePdfs(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error('Add at least one PDF to merge.')
  }

  const merged = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    const bytes = await files[i].arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const indices = doc.getPageIndices()
    const pages = await merged.copyPages(doc, indices)
    for (const page of pages) {
      merged.addPage(page)
    }
    onProgress?.(i + 1, files.length)
  }

  return merged.save()
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function createPdfId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
