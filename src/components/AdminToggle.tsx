import './AdminToggle.css'

interface AdminToggleProps {
  onClick: () => void
}

export default function AdminToggle({ onClick }: AdminToggleProps) {
  return (
    <div className="admin-toggle" onClick={onClick}>
      <img src="/src/images/Steamreublic.png" alt="Admin Access" className="admin-toggle-logo" />
    </div>
  )
}
