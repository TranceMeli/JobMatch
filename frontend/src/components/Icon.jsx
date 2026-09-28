const baseStyle = {
  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  lineHeight: 1,
  verticalAlign: 'middle',
  userSelect: 'none',
}

export default function Icon({ name, size = 20, color, style }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ ...baseStyle, fontSize: `${size}px`, color, ...style }}
    >
      {name}
    </span>
  )
}