module Resolvers
  class Timeline < BaseResolver
    type Types::TweetConnectionType, null: false
    description "フォロー中ユーザーのタイムライン"

    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(first:, after: nil)
      current_user = authenticate!

      followed_ids = Follow.where(follower_id: current_user.id).select(:followed_id)
      relation = Tweet.where(user_id: followed_ids).includes(:user)
      paginate_relation(relation, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    rescue StandardError
      raise_validation_error!("Failed to fetch timeline")
    end
  end
end
