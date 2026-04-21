import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-xl font-bold">ページが見つかりません</h1>
        <p className="mt-2 text-default-500 text-sm">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-primary text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
