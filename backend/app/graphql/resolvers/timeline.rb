module Resolvers
  class Timeline < BaseResolver
    type Types::TweetConnectionType, null: false
    description "フォロー中ユーザーのタイムライン"

    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(first:, after: nil)
      current_user = authenticate!

      paginate_relation(
        current_user.following_timeline_tweets,
        first: first,
        after: after
      )
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
