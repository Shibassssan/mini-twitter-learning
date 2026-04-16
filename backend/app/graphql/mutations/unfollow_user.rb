module Mutations
  class UnfollowUser < BaseMutation
    description "ユーザーのフォローを解除する"

    argument :user_uuid, ID, required: true

    type Types::UserType

    def resolve(user_uuid:)
      current_user = authenticate!
      target_user = User.find_by!(uuid: user_uuid)

      current_user.unfollow!(target_user)
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Follow relationship not found")
    end
  end
end
