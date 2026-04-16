module Resolvers
  class SearchTweets < BaseResolver
    type Types::TweetConnectionType, null: false
    description "ツイート検索（content 部分一致）"

    argument :query, String, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(query:, first:, after: nil)
      authenticate!

      relation = Tweet.search_content_substring(query)
      paginate_relation(relation, first: first, after: after)
    rescue ArgumentError => e
      raise_validation_error!(e.message)
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
