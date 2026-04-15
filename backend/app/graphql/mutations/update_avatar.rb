module Mutations
  class UpdateAvatar < BaseMutation
    description "自分のアバター画像をアップロードする"

    argument :avatar, ApolloUploadServer::Upload, required: true

    type Types::UserType

    def resolve(avatar:)
      user = context[:current_user] || raise_unauthenticated!

      validate_avatar!(avatar)

      ActiveRecord::Base.transaction do
        user.avatar.attach(
          io: avatar,
          filename: avatar.original_filename,
          content_type: avatar.content_type
        )
        user
      end
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      raise_validation_error!("Invalid avatar file")
    rescue StandardError
      raise_validation_error!("Failed to update avatar")
    end

    private

    MAX_FILE_SIZE = 2.megabytes
    ALLOWED_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze

    def validate_avatar!(avatar)
      unless ALLOWED_CONTENT_TYPES.include?(avatar.content_type)
        raise_validation_error!("Avatar must be JPEG, PNG, or WebP")
      end

      if avatar.size > MAX_FILE_SIZE
        raise_validation_error!("Avatar must be less than 2MB")
      end
    end
  end
end
