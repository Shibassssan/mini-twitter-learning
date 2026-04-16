module Resolvers
  class SearchUsers < BaseResolver
    type Types::UserConnectionType, null: false
    description "ユーザー検索（username / display_name 部分一致）"

    argument :query, String, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(query:, first:, after: nil)
      authenticate!

      relation = User.search_profiles_substring(query)
      paginate_relation(relation, first: first, after: after)
    rescue ArgumentError => e
      raise_validation_error!(e.message)
    rescue GraphQL::ExecutionError
      raise
    end
  end
end
