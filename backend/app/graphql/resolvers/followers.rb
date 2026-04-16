module Resolvers
  class Followers < BaseResolver
    type Types::UserConnectionType, null: false
    description "指定ユーザーのフォロワー一覧"

    argument :uuid, ID, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(uuid:, first:, after: nil)
      authenticate!

      user = User.find_by!(uuid: uuid)
      paginate_relation(
        user.followers_users_cursor_relation,
        first: first,
        after: after,
        paging_by: :follows
      )
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    end
  end
end
