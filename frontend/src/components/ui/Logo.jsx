export function Logo({ compact = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    }}>
      <img
        src="/logo.png"
        alt="SMIT – Saylani Mass IT Training"
        style={{
          width: compact ? '110px' : '150px',
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
          display: 'block',
        }}
      />
    </div>
  )
}
