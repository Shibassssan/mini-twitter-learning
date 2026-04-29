class ApplicationController < ActionController::API
  include ActionController::Cookies
  include JWTSessions::RailsAuthorization

  rescue_from JWTSessions::Errors::Unauthorized, with: :render_authentication_error

  # GraphQL RefreshToken mutation 用。
  # authorize_by_refresh_cookie! はデフォルトで X-CSRF-Token ヘッダを要求するが、
  # - access_token は Authorization: Bearer ヘッダ方式で Cookie 認証ではない
  # - refresh_token Cookie に対する CSRF 対策は GraphqlController#verify_request_origin
  #   による Origin/Referer 検証で担保済み
  # のため、CSRF トークンチェックは明示的にスキップする。
  def verify_refresh_for_graphql!
    cookie_based_auth(:refresh)
    @_csrf_check = false
    authorize_request(:refresh)
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
