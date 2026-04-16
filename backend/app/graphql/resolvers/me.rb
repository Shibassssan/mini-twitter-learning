module Resolvers
  class Me < BaseResolver
    type Types::UserType, null: true
    description "ログイン中のユーザー情報を返す"

    def resolve
      authenticate!
    end
  end
end
