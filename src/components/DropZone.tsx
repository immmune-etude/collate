import { useCallback, useId, useRef, useState } from 'react'
import type { PdfMeta } from '../lib/mergePdfs'
import { createPdfId, getFilePageCount } from '../lib/mergePdfs'

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
      const supported = Array.from(fileList).filter((f) => {
        const lower = f.name.toLowerCase()
        return (
          f.type === 'application/pdf' ||
          f.type === 'image/jpeg' ||
          lower.endsWith('.pdf') ||
          lower.endsWith('.jpg') ||
          lower.endsWith('.jpeg')
        )
      })
      if (supported.length === 0) return

      const withKind = supported.map((file) => {
        const lower = file.name.toLowerCase()
        const fileKind: PdfMeta['fileKind'] =
          file.type === 'application/pdf' || lower.endsWith('.pdf') ? 'pdf' : 'jpeg'
        return { file, fileKind }
      })

      if (withKind.length === 0) return

      setLoading(true)
      try {
        const items: PdfMeta[] = await Promise.all(
          withKind.map(async ({ file, fileKind }) => {
            const id = createPdfId()
            try {
              const pageCount = await getFilePageCount(file)
              return {
                id,
                file,
                name: file.name,
                size: file.size,
                pageCount,
                fileKind,
              }
            } catch {
              return {
                id,
                file,
                name: file.name,
                size: file.size,
                pageCount: null,
                fileKind,
                error: `Could not read this ${fileKind.toUpperCase()}`,
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
        accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg"
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
        {loading ? 'Reading files…' : dragging ? 'Drop to add' : 'Drop PDFs or JPEGs here'}
      </p>
      <p className="dropzone__hint">
        or{' '}
        <label htmlFor={inputId} className="dropzone__browse">
          browse files
        </label>
      </p>
    </div>
  )
}
