module Mutations
  class UpdateProfile < BaseMutation
    description "自分のプロフィール（表示名・自己紹介）を更新する"

    argument :display_name, String, required: false
    argument :bio, String, required: false

    type Types::UserType

    def resolve(**args)
      user = context[:current_user] || raise_unauthenticated!

      permitted = {}
      permitted[:display_name] = args[:display_name] if args.key?(:display_name)
      permitted[:bio] = args[:bio] if args.key?(:bio)

      raise_validation_error!("No attributes to update") if permitted.empty?

      ActiveRecord::Base.transaction do
        user.update!(permitted)
        user
      end
    end
  end
end
