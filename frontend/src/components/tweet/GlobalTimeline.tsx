import { PublicTimelineDocument } from '@/lib/graphql/generated/graphql'
import { TimelineList } from './TimelineList'

export function GlobalTimeline() {
  return (
    <TimelineList
      document={PublicTimelineDocument}
      dataKey="publicTimeline"
      emptyMessage="まだ投稿はありません"
    />
  )
}
