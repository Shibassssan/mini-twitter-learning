interface AppLogoProps {
  className?: string
}

export function AppLogo({ className = 'w-8 h-8 text-accent shrink-0' }: AppLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 32"
      fill="none"
    >
      <rect width="32" height="32" rx="10" fill="currentColor" />
      <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="22" r="4" fill="white" opacity="0.9" />
      <path d="M22.5 22l1 1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
