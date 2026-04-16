module Mutations
  class UpdateAvatar < BaseMutation
    description "自分のアバター画像をアップロードする"

    argument :avatar, ApolloUploadServer::Upload, required: true

    type Types::UserType

    def resolve(avatar:)
      user = authenticate!

      validate_avatar!(avatar)

      ActiveRecord::Base.transaction do
        user.avatar.attach(
          io: avatar,
          filename: avatar.original_filename,
          content_type: avatar.content_type
        )
        user
      end
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      raise_validation_error!("Invalid avatar file")
    end

    private

    MAX_FILE_SIZE = 2.megabytes
    ALLOWED_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze

    def validate_avatar!(avatar)
      io = avatar.respond_to?(:tempfile) && avatar.tempfile ? avatar.tempfile : avatar
      io.rewind if io.respond_to?(:rewind)
      detected_type = Marcel::MimeType.for(io, name: avatar.original_filename)
      io.rewind if io.respond_to?(:rewind)
      unless ALLOWED_CONTENT_TYPES.include?(detected_type)
        raise_validation_error!("Avatar must be JPEG, PNG, or WebP")
      end

      if avatar.size > MAX_FILE_SIZE
        raise_validation_error!("Avatar must be less than 2MB")
      end
    end
  end
end
