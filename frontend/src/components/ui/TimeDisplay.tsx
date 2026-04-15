import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ja'

dayjs.extend(relativeTime)
dayjs.locale('ja')

interface TimeDisplayProps {
  createdAt: string
}

export function TimeDisplay({ createdAt }: TimeDisplayProps) {
  const date = dayjs(createdAt)
  const now = dayjs()
  const diffHours = now.diff(date, 'hour')

  const displayText = diffHours < 24 ? date.fromNow() : date.format('YYYY/MM/DD')

  return (
    <time dateTime={createdAt} title={date.format('YYYY/MM/DD HH:mm')}>
      {displayText}
    </time>
  )
}
