import './PrivacyPolicy.css'

interface Props {
  onClose: () => void
}

export default function PrivacyPolicy({ onClose }: Props) {
  return (
    <div className="policy-overlay" role="dialog" aria-modal="true" aria-label="Privacy Policy">
      <div className="policy-container">
        <div className="policy-header">
          <h2>Privacy Policy</h2>
          <button className="policy-close" onClick={onClose} aria-label="Close privacy policy">✕</button>
        </div>
        <div className="policy-body">
          <p className="policy-date">Last updated: March 2026</p>

          <h3>1. Information We Collect</h3>
          <p>We collect your name, mobile number, and email address when you create a MomoWallet account. We also record your visit history and coin transactions.</p>

          <h3>2. How We Use Your Information</h3>
          <p>Your information is used to manage your loyalty account, track MomoCoins, send you promotional codes via WhatsApp (with your consent), and display leaderboard rankings.</p>

          <h3>3. WhatsApp Notifications</h3>
          <p>By providing your mobile number, you consent to receiving WhatsApp messages from Steam Republic about your MomoCoins, promotional codes, and account activity. You can opt out at any time by contacting us.</p>

          <h3>4. Data Sharing</h3>
          <p>We do not sell your personal data. Your name and coin balance may appear on the public leaderboard. We use Firebase (Google) for data storage and Twilio for messaging.</p>

          <h3>5. Data Retention</h3>
          <p>Your account data is retained as long as your account is active. You may request deletion by contacting us at the stall.</p>

          <h3>6. Your Rights</h3>
          <p>Under applicable law (including India's DPDP Act), you have the right to access, correct, or delete your personal data. Contact us at the stall or via WhatsApp to exercise these rights.</p>

          <h3>7. Contact</h3>
          <p>Steam Republic, [address]. For privacy concerns, speak to our staff directly.</p>
        </div>
        <button className="policy-accept" onClick={onClose}>I Understand</button>
      </div>
    </div>
  )
}
