module Resolvers
  class LikedTweets < BaseResolver
    type Types::TweetConnectionType, null: false
    description "自分がいいねしたツイート一覧"

    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(first:, after: nil)
      current_user = authenticate!

      relation = Tweet
        .joins(:likes)
        .where(likes: { user_id: current_user.id })
        .select("tweets.*, likes.created_at AS cursor_created_at, likes.id AS cursor_id")

      paginate_relation(relation, first: first, after: after, paging_by: :likes)
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
