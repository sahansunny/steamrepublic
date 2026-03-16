import { QRCodeSVG } from 'qrcode.react'
import './Barcode.css'

interface BarcodeProps {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
}

export default function Barcode({ value, width = 200, displayValue = true }: BarcodeProps) {
  if (!value) return null

  return (
    <div className="barcode-container">
      <QRCodeSVG
        value={value}
        size={width}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        className="barcode-canvas square-barcode"
      />
      {displayValue && (
        <p className="barcode-text">{value}</p>
      )}
    </div>
  )
}
