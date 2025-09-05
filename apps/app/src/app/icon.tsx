import { ImageResponse } from 'next/og'
import { ARTSY_ASCII } from '../components/shared/artsy-ascii'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  // Render the ASCII into a small canvas with brand colors
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a', // brand dark background
          color: '#faf9f7', // light foreground
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        <div
          style={{
            whiteSpace: 'pre',
            fontSize: 6, // tuned to fit 32x32
            lineHeight: 1,
            letterSpacing: -0.5,
          }}
        >
          {ARTSY_ASCII}
        </div>
      </div>
    ),
    { ...size }
  )
}

