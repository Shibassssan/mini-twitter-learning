# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      reject_unauthorized_connection if current_user.blank?
    end

    private

    def find_verified_user
      token = request.params[:token].to_s.strip
      return nil if token.blank?

      session = JWTSessions::Session.new
      return nil unless session.session_exists?(token, :access)

      payload = JWTSessions::Token.decode(token, {}).first
      user_id = payload["user_id"]
      User.find_by(id: user_id)
    rescue JWTSessions::Errors::Unauthorized, JWTSessions::Errors::InvalidPayload
      nil
    rescue StandardError
      nil
    end
  end
end
