import { useEffect, useState } from 'react'
import './Notification.css'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export default function Notification({ message, type, duration = 4000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  return (
    <div className={`notification ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}>
          ✕
        </button>
      </div>
    </div>
  )
}