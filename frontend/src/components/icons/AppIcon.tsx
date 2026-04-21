import { AppLogo } from '@/components/icons/AppLogo'

export function AppIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
      <AppLogo className="w-8 h-8 text-white" />
    </div>
  )
}
