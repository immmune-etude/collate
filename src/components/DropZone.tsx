import { useCallback, useId, useRef, useState } from 'react'
import type { PdfMeta } from '../lib/mergePdfs'
import { createPdfId, getPdfPageCount } from '../lib/mergePdfs'

type DropZoneProps = {
  onFilesAdded: (items: PdfMeta[]) => void
  disabled?: boolean
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const ingest = useCallback(
    async (fileList: FileList | File[]) => {
      const pdfs = Array.from(fileList).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (pdfs.length === 0) return

      setLoading(true)
      try {
        const items: PdfMeta[] = await Promise.all(
          pdfs.map(async (file) => {
            const id = createPdfId()
            try {
              const pageCount = await getPdfPageCount(file)
              return {
                id,
                file,
                name: file.name,
                size: file.size,
                pageCount,
              }
            } catch {
              return {
                id,
                file,
                name: file.name,
                size: file.size,
                pageCount: null,
                error: 'Could not read this PDF',
              }
            }
          }),
        )
        onFilesAdded(items)
      } finally {
        setLoading(false)
      }
    },
    [onFilesAdded],
  )

  return (
    <div
      className={`dropzone ${dragging ? 'dropzone--active' : ''} ${disabled || loading ? 'dropzone--disabled' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (disabled || loading) return
        void ingest(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        disabled={disabled || loading}
        onChange={(e) => {
          if (e.target.files) void ingest(e.target.files)
          e.target.value = ''
        }}
      />
      <div className="dropzone__visual" aria-hidden="true">
        <span className="stack-sheet stack-sheet--1" />
        <span className="stack-sheet stack-sheet--2" />
        <span className="stack-sheet stack-sheet--3" />
      </div>
      <p className="dropzone__title">
        {loading ? 'Reading PDFs…' : dragging ? 'Drop to add' : 'Drop PDFs here'}
      </p>
      <p className="dropzone__hint">
        or{' '}
        <label htmlFor={inputId} className="dropzone__browse">
          browse files
        </label>
        {' · '}no limit on count
      </p>
      <p className="dropzone__meta">Files stay on your device · processed locally</p>
    </div>
  )
}
