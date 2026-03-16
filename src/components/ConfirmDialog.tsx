import './ConfirmDialog.css'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-no" onClick={onCancel}>No, Stay</button>
          <button className="confirm-yes" onClick={onConfirm}>Yes, Logout</button>
        </div>
      </div>
    </div>
  )
}
