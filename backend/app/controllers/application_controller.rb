class ApplicationController < ActionController::API
  include ActionController::Cookies
  include JWTSessions::RailsAuthorization

  rescue_from JWTSessions::Errors::Unauthorized, with: :render_authentication_error

  private

  def current_user
    return @current_user if defined?(@current_user)
    return @current_user = nil if found_token.blank?

    authorize_access_request!
    @current_user = User.find(payload["user_id"])
  rescue ActiveRecord::RecordNotFound
    raise JWTSessions::Errors::Unauthorized, "User not found"
  end

  def render_authentication_error(_error)
    render json: {
      data: nil,
      errors: [
        {
          message: "Authentication failed",
          extensions: {
            code: "AUTHENTICATION_ERROR"
          }
        }
      ]
    }, status: :unauthorized
  end
end
