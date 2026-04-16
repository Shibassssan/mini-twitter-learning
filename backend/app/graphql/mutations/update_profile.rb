module Mutations
  class UpdateProfile < BaseMutation
    description "自分のプロフィール（表示名・自己紹介）を更新する"

    argument :display_name, String, required: false
    argument :bio, String, required: false

    type Types::UserType

    def resolve(**args)
      user = authenticate!

      permitted = {}
      permitted[:display_name] = args[:display_name] if args.key?(:display_name)
      permitted[:bio] = args[:bio] if args.key?(:bio)

      user.update_profile!(permitted)
    rescue ArgumentError => e
      raise_validation_error!(e.message)
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    end
  end
end
