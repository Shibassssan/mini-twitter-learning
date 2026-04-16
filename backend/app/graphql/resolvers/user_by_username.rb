module Resolvers
  class UserByUsername < BaseResolver
    type Types::UserType, null: false
    description "ユーザー名でユーザー情報を取得"

    argument :username, String, required: true

    def resolve(username:)
      authenticate!

      User.find_by!(username: username)
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    rescue StandardError
      raise_validation_error!("Failed to fetch user")
    end
  end
end
