import './UltimateLoader.css'

interface UltimateLoaderProps {
  message?: string
}

export default function UltimateLoader({ message = "Loading Ultimate Experience..." }: UltimateLoaderProps) {
  return (
    <div className="ultimate-loader">
      <div className="loader-container">
        <div className="loader-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        <div className="loader-logo">
          <img src="/src/images/Steamreublic.png" alt="Steam Republic" className="loader-logo-image" />
        </div>
      </div>
      <h2 className="loader-text">{message}</h2>
      <div className="loader-particles">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="loader-particle"
            style={{
              '--delay': `${i * 0.1}s`,
              '--angle': `${i * 30}deg`
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}