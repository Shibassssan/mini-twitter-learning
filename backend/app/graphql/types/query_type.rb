module Types
  class QueryType < Types::BaseObject
    field :me, Types::UserType, null: true, description: "ログイン中のユーザー情報を返す"

    def me
      context[:current_user] || raise_unauthenticated!
    end

    private

    def raise_unauthenticated!
      raise GraphQL::ExecutionError.new(
        "Authentication required",
        extensions: { code: "AUTHENTICATION_ERROR" }
      )
    end
  end
end
