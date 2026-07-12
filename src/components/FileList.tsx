import { useState } from 'react'
import type { PdfMeta } from '../lib/mergePdfs'
import { formatBytes } from '../lib/mergePdfs'

type FileListProps = {
  items: PdfMeta[]
  onReorder: (from: number, to: number) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

export function FileList({ items, onReorder, onRemove, disabled }: FileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  const totalPages = items.reduce((sum, item) => sum + (item.pageCount ?? 0), 0)
  const totalSize = items.reduce((sum, item) => sum + item.size, 0)

  return (
    <section className="file-list" aria-label="PDF queue">
      <header className="file-list__header">
        <h2 className="file-list__title">Queue</h2>
        <p className="file-list__summary">
          {items.length} file{items.length === 1 ? '' : 's'}
          {totalPages > 0 ? ` · ${totalPages} page${totalPages === 1 ? '' : 's'}` : ''}
          {` · ${formatBytes(totalSize)}`}
        </p>
      </header>

      <ol className="file-list__items">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={[
              'file-row',
              dragIndex === index ? 'file-row--dragging' : '',
              overIndex === index && dragIndex !== index ? 'file-row--over' : '',
              item.error ? 'file-row--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            draggable={!disabled}
            onDragStart={() => {
              if (disabled) return
              setDragIndex(index)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              if (disabled || dragIndex === null) return
              setOverIndex(index)
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (disabled || dragIndex === null || dragIndex === index) {
                setDragIndex(null)
                setOverIndex(null)
                return
              }
              onReorder(dragIndex, index)
              setDragIndex(null)
              setOverIndex(null)
            }}
          >
            <span className="file-row__handle" aria-hidden="true" title="Drag to reorder">
              <span />
              <span />
              <span />
            </span>
            <span className="file-row__index">{index + 1}</span>
            <div className="file-row__body">
              <p className="file-row__name">{item.name}</p>
              <p className="file-row__meta">
                {item.error
                  ? item.error
                  : [
                      item.pageCount != null
                        ? `${item.pageCount} page${item.pageCount === 1 ? '' : 's'}`
                        : null,
                      formatBytes(item.size),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </p>
            </div>
            <button
              type="button"
              className="file-row__remove"
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
