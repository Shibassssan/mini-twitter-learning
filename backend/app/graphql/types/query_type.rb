module Types
  class QueryType < Types::BaseObject
    field :me, Types::UserType, null: true, description: "ログイン中のユーザー情報を返す"

    def me
      context[:current_user]
    end
  end
end
