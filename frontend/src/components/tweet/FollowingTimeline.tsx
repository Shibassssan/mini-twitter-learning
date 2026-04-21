import { TimelineDocument } from '@/lib/graphql/generated/graphql'
import { TimelineList } from './TimelineList'

export function FollowingTimeline() {
  return (
    <TimelineList
      document={TimelineDocument}
      dataKey="timeline"
      emptyMessage="フォロー中のユーザーの投稿はありません"
      newTweetFilter="following"
    />
  )
}
