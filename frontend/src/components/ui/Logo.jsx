export function Logo({ compact = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img
        src="/logo.png"
        alt="SMIT – Saylani Mass IT Training"
        style={{
          height: compact ? '32px' : '40px',
          width: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
    </div>
  )
}
