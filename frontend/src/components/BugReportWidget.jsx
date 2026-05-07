import { useState } from 'react'
import { FiAlertCircle, FiImage, FiSend, FiX } from 'react-icons/fi'
import client from '../api/client'
import './BugReportWidget.css'

export default function BugReportWidget() {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  const onImage = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const { data } = await client.post('/api/bug-report/upload', body)
      setImageUrl(data.url || '')
    } catch {
      setMessage('Image upload failed. You can submit without image.')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!description.trim()) {
      setMessage('Please enter bug description.')
      return
    }
    setSending(true)
    setMessage('')
    try {
      await client.post('/api/bug-report', {
        description: description.trim(),
        image_url: imageUrl,
        page_url: window.location.href,
      })
      setDescription('')
      setImageUrl('')
      setOpen(false)
      setMessage('')
      alert('Your bug is reported and we would fix it soon. Thank you.')
    } catch (e2) {
      setMessage(e2?.response?.data?.error || 'Failed to submit bug report')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button className="bug-fab" type="button" onClick={() => setOpen(true)}>
        <FiAlertCircle />
        <span>Report Bug</span>
      </button>

      {open && (
        <>
          <button type="button" className="bug-overlay" onClick={() => setOpen(false)} aria-label="Close report bug modal" />
          <div className="bug-modal">
            <div className="bug-head">
              <h3>Report a Bug</h3>
              <button type="button" className="bug-close" onClick={() => setOpen(false)}>
                <FiX />
              </button>
            </div>
            <p className="bug-sub">Describe what went wrong. Image is optional.</p>
            <form onSubmit={submit}>
              <textarea
                className="bug-textarea"
                rows={5}
                placeholder="Explain the issue, steps to reproduce, and what you expected."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="bug-upload-row">
                <label className="bug-upload-btn">
                  <FiImage />
                  <span>{uploading ? 'Uploading...' : 'Attach image (optional)'}</span>
                  <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} hidden disabled={uploading} />
                </label>
                {imageUrl && <span className="bug-upload-done">Image attached</span>}
              </div>
              {message && <div className="bug-msg">{message}</div>}
              <button type="submit" className="bug-submit" disabled={sending}>
                <FiSend />
                <span>{sending ? 'Submitting...' : 'Submit Bug Report'}</span>
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
