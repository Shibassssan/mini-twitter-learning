module Mutations
  class FollowUser < BaseMutation
    description "ユーザーをフォローする"

    argument :user_uuid, ID, required: true

    type Types::UserType

    def resolve(user_uuid:)
      current_user = authenticate!
      target_user = User.find_by!(uuid: user_uuid)

      current_user.follow!(target_user)
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    rescue ActiveRecord::RecordNotUnique
      raise_validation_error!("Already following this user")
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    end
  end
end
