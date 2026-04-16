module Resolvers
  class SearchTweets < BaseResolver
    type Types::TweetConnectionType, null: false
    description "ツイート検索（content 部分一致）"

    argument :query, String, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(query:, first:, after: nil)
      authenticate!

      q = query.strip
      raise_validation_error!("Search query must be at least 3 characters") if q.length < 3

      sanitized = ActiveRecord::Base.sanitize_sql_like(q)
      relation = Tweet.where("content ILIKE :q", q: "%#{sanitized}%")
      paginate_relation(relation, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
