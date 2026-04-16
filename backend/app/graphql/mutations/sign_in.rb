module Mutations
  class SignIn < BaseMutation
    description "メールアドレスとパスワードでログインする"

    argument :email, String, required: true
    argument :password, String, required: true

    type Types::AuthPayloadType

    def resolve(email:, password:)
      result = AuthService.authenticate(email: email, password: password)

      set_refresh_cookie!(result[:tokens][:refresh])

      { access_token: result[:tokens][:access], user: result[:user] }
    rescue AuthService::AuthenticationError => e
      raise GraphQL::ExecutionError.new(
        e.message,
        extensions: { code: "AUTHENTICATION_ERROR" }
      )
    end

  end
end
