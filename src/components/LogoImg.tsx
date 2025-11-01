type Props = {
  className?: string
}

export default function LogoImg({ className = "" }: Props) {
  const defaultSize = "h-12 sm:h-16 md:h-20"
  const wrapperClass = `site-logo flex items-center ${className || defaultSize}`.trim()
  const fallbackStyle = { minHeight: '3rem' }

  return (
    <span className={wrapperClass} style={fallbackStyle}>
      <img
        src="/branding/logos/soccerconnect_logo.min.svg"
        alt="SoccerConnect logo"
        className="block h-full w-auto"
        role="img"
        aria-label="SoccerConnect logo"
      />
    </span>
  )
}
