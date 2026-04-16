class ApplicationController < ActionController::API
  include ActionController::Cookies
  include JWTSessions::RailsAuthorization

  rescue_from JWTSessions::Errors::Unauthorized, with: :render_authentication_error

  # GraphQL RefreshToken mutation 用（private の authorize_by_refresh_cookie! などを隠蔽）
  def verify_refresh_for_graphql!
    authorize_by_refresh_cookie!
    { payload: payload.to_h, token: found_token }
  end

  private

  def current_user
    return @current_user if defined?(@current_user)
    return @current_user = nil if access_header_token.blank?

    authorize_by_access_header!
    @current_user = User.find(payload["user_id"])
  rescue ActiveRecord::RecordNotFound
    raise JWTSessions::Errors::Unauthorized, "User not found"
  end

  def access_header_token
    authorization = request.headers["Authorization"].to_s
    scheme, token = authorization.split(" ", 2)

    return if scheme != "Bearer"

    token
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
