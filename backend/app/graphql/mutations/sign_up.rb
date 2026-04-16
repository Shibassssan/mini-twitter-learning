module Mutations
  class SignUp < BaseMutation
    description "ユーザーを作成し、認証トークンを発行する"

    argument :username, String, required: true
    argument :email, String, required: true
    argument :password, String, required: true
    argument :display_name, String, required: true

    type Types::AuthPayloadType

    def resolve(username:, email:, password:, display_name:)
      result = AuthService.register(
        username: username,
        email: email,
        password: password,
        display_name: display_name
      )

      set_refresh_cookie!(result[:tokens][:refresh])

      { access_token: result[:tokens][:access], user: result[:user] }
    rescue AuthService::RegistrationError => e
      raise_validation_error!(e.message)
    end
  end
end
