module Mutations
  class RefreshToken < BaseMutation
    description "リフレッシュトークンから新しいアクセストークンを発行する"

    type Types::AuthPayloadType

    def resolve
      controller = context[:controller]
      raise GraphQL::ExecutionError, "Controller context is missing" unless controller

      controller.send(:authorize_by_refresh_cookie!)

      refresh_payload = controller.send(:payload).to_h
      refresh_token = controller.send(:found_token)
      user = User.find(refresh_payload.fetch("user_id"))
      tokens = AuthService.refresh_access_token!(refresh_token, payload: refresh_payload)

      {
        access_token: tokens[:access],
        user: user
      }
    rescue JWTSessions::Errors::Unauthorized, ActiveRecord::RecordNotFound, KeyError
      raise_unauthenticated!
    end

    private

    def raise_unauthenticated!
      raise GraphQL::ExecutionError.new(
        "Authentication required",
        extensions: { code: "AUTHENTICATION_ERROR" }
      )
    end
  end
end
