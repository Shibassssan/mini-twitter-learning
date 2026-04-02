class AuthService
  class << self
    def issue_tokens_for(user)
      session = JWTSessions::Session.new(payload: session_payload(user))
      session.login
    end

    def refresh_access_token!(refresh_token, payload:)
      session = JWTSessions::Session.new(payload: payload.symbolize_keys)
      session.refresh(refresh_token)
    end

    def flush_refresh_token!(refresh_token)
      JWTSessions::Session.new.flush_by_token(refresh_token)
    end

    def refresh_cookie_options(refresh_token)
      {
        value: refresh_token,
        httponly: true,
        secure: Rails.env.production?,
        same_site: refresh_cookie_same_site,
        expires: JWTSessions.refresh_exp_time.seconds.from_now
      }
    end

    private

    def session_payload(user)
      { user_id: user.id }
    end

    def refresh_cookie_same_site
      return :lax unless JWTSessions.respond_to?(:refresh_cookie_same_site)

      value = JWTSessions.refresh_cookie_same_site
      value.present? ? value.downcase.to_sym : :lax
    end
  end
end
