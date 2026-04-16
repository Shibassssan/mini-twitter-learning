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
      followed_ids = Follow.where(follower_id: user.id).select(:followed_id)
      relation = User.where(id: followed_ids)
      paginate_relation(relation, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    rescue StandardError
      raise_validation_error!("Failed to fetch following users")
    end
  end
end
