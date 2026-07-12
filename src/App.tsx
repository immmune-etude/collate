import { useCallback, useState } from 'react'
import { DropZone } from './components/DropZone'
import { FileList } from './components/FileList'
import {
  downloadPdf,
  mergePdfs,
  type PdfMeta,
} from './lib/mergePdfs'

type MergeState =
  | { status: 'idle' }
  | { status: 'merging'; completed: number; total: number }
  | { status: 'done'; filename: string }
  | { status: 'error'; message: string }

export default function App() {
  const [items, setItems] = useState<PdfMeta[]>([])
  const [mergeState, setMergeState] = useState<MergeState>({ status: 'idle' })

  const busy = mergeState.status === 'merging'

  const onFilesAdded = useCallback((incoming: PdfMeta[]) => {
    setItems((prev) => [...prev, ...incoming])
    setMergeState({ status: 'idle' })
  }, [])

  const onReorder = useCallback((from: number, to: number) => {
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const onRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setMergeState({ status: 'idle' })
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    setMergeState({ status: 'idle' })
  }, [])

  const handleMerge = useCallback(async () => {
    const valid = items.filter((item) => !item.error)
    if (valid.length === 0) {
      setMergeState({ status: 'error', message: 'Add at least one readable PDF.' })
      return
    }

    setMergeState({ status: 'merging', completed: 0, total: valid.length })

    try {
      const bytes = await mergePdfs(
        valid.map((item) => item.file),
        (completed, total) => setMergeState({ status: 'merging', completed, total }),
      )
      const stamp = new Date().toISOString().slice(0, 10)
      const filename = `collate-${stamp}.pdf`
      downloadPdf(bytes, filename)
      setMergeState({ status: 'done', filename })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Merge failed.'
      setMergeState({ status: 'error', message })
    }
  }, [items])

  const progress =
    mergeState.status === 'merging'
      ? Math.round((mergeState.completed / mergeState.total) * 100)
      : 0

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      <header className="hero">
        <p className="brand">Collate</p>
        <h1 className="hero__headline">Merge unlimited PDFs.</h1>
        <p className="hero__sub">
          Drop in as many documents as you need — no 10-file cap. Everything runs in your browser.
        </p>
      </header>

      <main className="workspace">
        <DropZone onFilesAdded={onFilesAdded} disabled={busy} />

        <FileList
          items={items}
          onReorder={onReorder}
          onRemove={onRemove}
          disabled={busy}
        />

        {items.length > 0 && (
          <div className="actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={clearAll}
              disabled={busy}
            >
              Clear all
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void handleMerge()}
              disabled={busy || items.every((i) => i.error)}
            >
              {busy
                ? `Merging ${mergeState.status === 'merging' ? `${mergeState.completed}/${mergeState.total}` : '…'}`
                : `Merge ${items.filter((i) => !i.error).length} PDF${items.filter((i) => !i.error).length === 1 ? '' : 's'}`}
            </button>
          </div>
        )}

        {busy && (
          <div className="progress" role="status" aria-live="polite">
            <div className="progress__track">
              <div className="progress__bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress__label">Combining documents… {progress}%</p>
          </div>
        )}

        {mergeState.status === 'done' && (
          <p className="status status--ok" role="status">
            Downloaded <strong>{mergeState.filename}</strong>
          </p>
        )}

        {mergeState.status === 'error' && (
          <p className="status status--err" role="alert">
            {mergeState.message}
          </p>
        )}
      </main>

      <footer className="footer">
        <p>Private by design — PDFs never leave this device.</p>
      </footer>
    </div>
  )
}
