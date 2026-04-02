module Mutations
  class SignUp < BaseMutation
    description "ユーザーを作成し、認証トークンを発行する"

    argument :username, String, required: true
    argument :email, String, required: true
    argument :password, String, required: true
    argument :display_name, String, required: true

    type Types::AuthPayloadType

    def resolve(username:, email:, password:, display_name:)
      user = nil
      tokens = nil

      ActiveRecord::Base.transaction do
        user = User.create!(
          username: username,
          display_name: display_name
        )

        user.create_credential!(
          email: email,
          password: password
        )

        tokens = AuthService.issue_tokens_for(user)
      end

      set_refresh_cookie!(tokens[:refresh])

      {
        access_token: tokens[:access],
        user: user
      }
    rescue ActiveRecord::RecordInvalid => e
      raise GraphQL::ExecutionError.new(
        e.record.errors.full_messages.join(", "),
        extensions: { code: "VALIDATION_ERROR" }
      )
    rescue GraphQL::ExecutionError
      cleanup_user!(user)
      raise
    rescue StandardError => e
      cleanup_user!(user)
      raise GraphQL::ExecutionError.new(
        "Failed to create session",
        extensions: { code: "INTERNAL_SERVER_ERROR" }
      )
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

    def cleanup_user!(user)
      return unless user&.persisted?

      user.destroy!
    rescue StandardError
      nil
    end
  end
end
