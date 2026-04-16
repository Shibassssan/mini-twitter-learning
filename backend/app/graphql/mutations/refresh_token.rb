module Mutations
  class RefreshToken < BaseMutation
    description "リフレッシュトークンから新しいアクセストークンを発行する"

    type Types::AuthPayloadType

    def resolve
      controller = context[:controller]
      raise GraphQL::ExecutionError, "Controller context is missing" unless controller

      session = controller.verify_refresh_for_graphql!
      refresh_payload = session[:payload]
      refresh_token = session[:token]
      user = User.find(refresh_payload.fetch("user_id"))
      tokens = AuthService.refresh_access_token!(refresh_token, payload: refresh_payload)

      {
        access_token: tokens[:access],
        user: user
      }
    rescue JWTSessions::Errors::Unauthorized, ActiveRecord::RecordNotFound, KeyError
      raise_unauthenticated!
    end
  end
end
