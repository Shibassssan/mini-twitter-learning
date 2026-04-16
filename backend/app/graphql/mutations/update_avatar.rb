module Mutations
  class UpdateAvatar < BaseMutation
    description "自分のアバター画像をアップロードする"

    argument :avatar, ApolloUploadServer::Upload, required: true

    type Types::UserType

    def resolve(avatar:)
      user = authenticate!

      user.attach_avatar_upload!(avatar)
    rescue ArgumentError => e
      raise_validation_error!(e.message)
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      raise_validation_error!("Invalid avatar file")
    end
  end
end
