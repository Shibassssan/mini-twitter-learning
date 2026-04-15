import { useUiStore } from '@/lib/stores/uiStore'
import { UserTweetsList } from '@/components/tweet/UserTweetsList'
import { LikedTweetsList } from '@/components/tweet/LikedTweetsList'

interface ProfileTabsProps {
  userId: string
  isOwnProfile: boolean
}

export function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  const { activeProfileTab, setActiveProfileTab } = useUiStore()

  return (
    <>
      <div className="flex border-b border-divider mt-2">
        <button
          type="button"
          onClick={() => setActiveProfileTab('tweets')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeProfileTab === 'tweets'
              ? 'border-primary text-primary'
              : 'border-transparent text-default-500'
          }`}
        >
          ツイート
        </button>
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setActiveProfileTab('likes')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeProfileTab === 'likes'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            いいね
          </button>
        )}
      </div>

      {activeProfileTab === 'tweets' || !isOwnProfile ? (
        <UserTweetsList userId={userId} />
      ) : (
        <LikedTweetsList />
      )}
    </>
  )
}
