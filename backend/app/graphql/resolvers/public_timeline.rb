module Resolvers
  class PublicTimeline < BaseResolver
    type Types::TweetConnectionType, null: false
    description "全体タイムライン"

    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(first:, after: nil)
      authenticate!

      paginate_relation(Tweet.all, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
