module Mutations
  class FollowUser < BaseMutation
    description "ユーザーをフォローする"

    argument :user_uuid, ID, required: true

    type Types::UserType

    def resolve(user_uuid:)
      current_user = context[:current_user] || raise_unauthenticated!
      target_user = User.find_by!(uuid: user_uuid)

      raise_validation_error!("Cannot follow yourself") if current_user.id == target_user.id

      ActiveRecord::Base.transaction do
        Follow.create!(follower: current_user, followed: target_user)
        target_user.reload
      end
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    rescue ActiveRecord::RecordNotUnique
      raise_validation_error!("Already following this user")
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    rescue StandardError
      raise_validation_error!("Failed to follow user")
    end
  end
end
