module Mutations
  class UnfollowUser < BaseMutation
    description "ユーザーのフォローを解除する"

    argument :user_uuid, ID, required: true

    type Types::UserType

    def resolve(user_uuid:)
      current_user = context[:current_user] || raise_unauthenticated!
      target_user = User.find_by!(uuid: user_uuid)

      ActiveRecord::Base.transaction do
        follow = Follow.find_by!(follower: current_user, followed: target_user)
        follow.destroy!
        target_user.reload
      end
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Follow relationship not found")
    rescue StandardError
      raise_validation_error!("Failed to unfollow user")
    end
  end
end
