module Resolvers
  class SearchUsers < BaseResolver
    type Types::UserConnectionType, null: false
    description "ユーザー検索（username / display_name 部分一致）"

    argument :query, String, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(query:, first:, after: nil)
      authenticate!

      raise_validation_error!("Search query must be at least 1 character") if query.strip.blank?

      sanitized = ActiveRecord::Base.sanitize_sql_like(query.strip)
      relation = User.where("username ILIKE :q OR display_name ILIKE :q", q: "%#{sanitized}%")
      paginate_relation(relation, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    rescue StandardError
      raise_validation_error!("Failed to search users")
    end
  end
end
