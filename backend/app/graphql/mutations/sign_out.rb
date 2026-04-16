module Mutations
  class SignOut < BaseMutation
    description "現在のセッションを無効化してログアウトする"

    type Boolean

    def resolve
      authenticate!

      refresh_token = context[:cookies][JWTSessions.refresh_cookie]
      raise_unauthenticated! if refresh_token.blank?

      AuthService.flush_refresh_token!(refresh_token)
      clear_refresh_cookie!

      true
    rescue JWTSessions::Errors::Unauthorized
      raise_unauthenticated!
    end

    private

    def clear_refresh_cookie!
      response = context[:response]
      raise GraphQL::ExecutionError, "Response context is missing" unless response

      response.delete_cookie(
        JWTSessions.refresh_cookie,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax
      )
    end
  end
end
