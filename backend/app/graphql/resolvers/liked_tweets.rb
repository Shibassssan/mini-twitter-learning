module Resolvers
  class LikedTweets < BaseResolver
    type Types::TweetConnectionType, null: false
    description "自分がいいねしたツイート一覧"

    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(first:, after: nil)
      current_user = authenticate!

      paginate_relation(
        current_user.liked_tweets_cursor_relation,
        first: first,
        after: after,
        paging_by: :likes
      )
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
