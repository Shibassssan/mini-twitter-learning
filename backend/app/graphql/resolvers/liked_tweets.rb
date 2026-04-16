module Resolvers
  class LikedTweets < BaseResolver
    type Types::TweetConnectionType, null: false
    description "自分がいいねしたツイート一覧"

    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(first:, after: nil)
      current_user = authenticate!

      tweet_ids = current_user.likes.order(created_at: :desc).select(:tweet_id)
      relation = Tweet.where(id: tweet_ids).includes(:user)
      paginate_relation(relation, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    rescue StandardError
      raise_validation_error!("Failed to fetch liked tweets")
    end
  end
end
