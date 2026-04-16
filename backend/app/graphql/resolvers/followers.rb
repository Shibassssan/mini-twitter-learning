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
      follower_ids = Follow.where(followed_id: user.id).select(:follower_id)
      relation = User.where(id: follower_ids)
      paginate_relation(relation, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    rescue StandardError
      raise_validation_error!("Failed to fetch followers")
    end
  end
end
