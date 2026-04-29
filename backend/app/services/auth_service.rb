class AuthService
  class RegistrationError < StandardError; end
  class AuthenticationError < StandardError; end

  class << self
    def register(username:, email:, password:, display_name:)
      user = nil
      tokens = nil

      ActiveRecord::Base.transaction do
        user = User.create!(username: username, display_name: display_name)
        user.create_credential!(email: email, password: password)
        tokens = issue_tokens_for(user)
      end

      { user: user, tokens: tokens }
    rescue ActiveRecord::RecordInvalid => e
      raise RegistrationError, extract_registration_message(e)
    end

    def authenticate(email:, password:)
      credential = Credential.find_by(email: email)
      raise AuthenticationError, "Invalid email or password" unless credential&.authenticate(password)

      tokens = issue_tokens_for(credential.user)
      { user: credential.user, tokens: tokens }
    end

    def issue_tokens_for(user)
      payload = session_payload(user)
      # refresh_payload にも user_id を載せないと、refresh_token 単独では
      # Mutations::RefreshToken がユーザーを特定できない（JWTSessions は
      # refresh 時に login 時の payload を自動復元しないため）。
      session = JWTSessions::Session.new(payload: payload, refresh_payload: payload)
      session.login
    end

    def refresh_access_token!(refresh_token, payload:)
      # JWT の予約クレーム（exp/uid 等）を除外し、アプリ固有の user_id のみ引き継ぐ。
      # これを渡さないと新しい access_token の exp/uid が既存値とバッティングする。
      user_id = payload.with_indifferent_access.fetch("user_id")
      new_payload = { user_id: user_id }

      # JWTSessions#refresh は refresh_token を rotation しない（access_token のみ再発行）。
      # セキュリティ上は refresh_token も必ず rotation したいので、
      # 旧セッションを flush してから login し直すことで rotation を強制する。
      flush_session = JWTSessions::Session.new
      flush_session.flush_by_token(refresh_token)

      session = JWTSessions::Session.new(
        payload: new_payload,
        refresh_payload: new_payload
      )
      session.login
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
        path: "/",
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

    def extract_registration_message(error)
      record = error.record
      if record.errors.of_kind?(:email, :taken) || record.errors.of_kind?(:username, :taken)
        "Unable to create account. Please verify your information."
      else
        record.errors.full_messages.join(", ")
      end
    end
  end
end
