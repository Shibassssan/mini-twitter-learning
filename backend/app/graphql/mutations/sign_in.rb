module Mutations
  class SignIn < BaseMutation
    description "メールアドレスとパスワードでログインする"

    argument :email, String, required: true
    argument :password, String, required: true

    type Types::AuthPayloadType

    def resolve(email:, password:)
      credential = Credential.find_by(email: email)

      unless credential&.authenticate(password)
        raise GraphQL::ExecutionError.new(
          "Invalid email or password",
          extensions: { code: "AUTHENTICATION_ERROR" }
        )
      end

      tokens = AuthService.issue_tokens_for(credential.user)
      set_refresh_cookie!(tokens[:refresh])

      {
        access_token: tokens[:access],
        user: credential.user
      }
    end

    private

    def set_refresh_cookie!(refresh_token)
      response = context[:response]
      raise GraphQL::ExecutionError, "Response context is missing" unless response

      response.set_cookie(
        JWTSessions.refresh_cookie,
        AuthService.refresh_cookie_options(refresh_token)
      )
    end
  end
end
