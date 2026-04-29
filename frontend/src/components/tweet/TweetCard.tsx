import { memo } from "react";
import { Button } from "@heroui/react";
import { TimeDisplay } from "@/components/ui/TimeDisplay";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { useTweetDeleteAction } from "@/lib/hooks/useTweetDeleteAction";
import { useTweetLikeAction } from "@/lib/hooks/useTweetLikeAction";
import { useAuthStore } from "@/lib/stores/authStore";

export type TweetCardData = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

type TweetCardProps = {
  tweet: TweetCardData;
  onDelete?: (id: string) => void;
}

export const TweetCard = memo(function TweetCard({
  tweet,
  onDelete,
}: TweetCardProps) {
  const { user } = useAuthStore();
  const {
    showConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    isDeleting,
  } = useTweetDeleteAction({
    tweet,
    onDelete,
  });
  const { toggleLike, isLikeMutating } = useTweetLikeAction({ tweet });
  const isMyTweet = user?.id === tweet.author.id;

  return (
    <>
      <article
        className="
        group mx-3 my-1.5 flex gap-3 p-4
        rounded-2xl border border-border
        bg-surface shadow-sm
        hover:shadow-md hover:border-border
        transition-all duration-150 cursor-default
      "
      >
        <div className="shrink-0">
          <InitialsAvatar
            displayName={tweet.author.displayName}
            avatarUrl={tweet.author.avatarUrl}
            username={tweet.author.username}
            size="md"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-foreground leading-none">
              {tweet.author.displayName}
            </span>
            <span className="text-muted text-xs">@{tweet.author.username}</span>
            <span className="text-muted text-xs">·</span>
            <span className="text-muted text-xs">
              <TimeDisplay createdAt={tweet.createdAt} />
            </span>
            {isMyTweet && (
              <Button
                variant="ghost"
                size="sm"
                onPress={openDeleteConfirm}
                className="ml-auto text-muted hover:text-danger text-xs h-auto py-0.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                削除
              </Button>
            )}
          </div>

          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
            {tweet.content}
          </p>

          {/* アクションバー */}
          <div className="mt-2 flex items-center gap-1">
            {/* 返信（非機能・UI表示のみ） */}
            <button
              type="button"
              aria-label="返信"
              disabled
              className="group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-500 disabled:cursor-default disabled:opacity-100"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
            </button>

            {/* リポスト（非機能・UI表示のみ） */}
            <button
              type="button"
              aria-label="リポスト"
              disabled
              className="group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-500 disabled:cursor-default disabled:opacity-100"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                />
              </svg>
            </button>

            {/* いいね（機能あり） */}
            <Button
              variant="ghost"
              size="sm"
              onPress={toggleLike}
              isDisabled={isLikeMutating}
              aria-label={tweet.isLikedByMe ? "いいねを取り消す" : "いいねする"}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs h-auto transition-colors
                ${
                  tweet.isLikedByMe
                    ? "text-rose-500 hover:bg-rose-50"
                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                }`}
            >
              <HeartIcon filled={tweet.isLikedByMe} />
              {tweet.likesCount > 0 && (
                <span className="tabular-nums font-medium">
                  {tweet.likesCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="投稿を削除"
        message="この投稿を削除しますか？この操作は取り消せません。"
        confirmLabel="削除"
        isLoading={isDeleting}
      />
    </>
  );
});
