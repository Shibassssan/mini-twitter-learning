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
    end
  end
end
