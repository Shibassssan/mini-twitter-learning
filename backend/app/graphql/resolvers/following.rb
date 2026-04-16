module Resolvers
  class Following < BaseResolver
    type Types::UserConnectionType, null: false
    description "指定ユーザーのフォロー中一覧"

    argument :uuid, ID, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(uuid:, first:, after: nil)
      authenticate!

      user = User.find_by!(uuid: uuid)
      relation = User
        .with_attached_avatar
        .joins("INNER JOIN follows ON follows.followed_id = users.id")
        .where(follows: { follower_id: user.id })
        .select("users.*, follows.created_at AS cursor_created_at, follows.id AS cursor_id")

      paginate_relation(relation, first: first, after: after, paging_by: :follows)
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    end
  end
end
