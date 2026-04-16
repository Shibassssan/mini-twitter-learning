class GraphqlController < ApplicationController
  before_action :verify_request_origin, only: :execute

  def execute
    render json: MiniTwitterSchema.execute(
      params[:query],
      variables: prepare_variables(params[:variables]),
      operation_name: params[:operationName],
      context: {
        controller: self,
        current_user: current_user,
        request: request,
        response: response,
        cookies: cookies
      }
    )
  end

  private

  def verify_request_origin
    allowed = ENV.fetch("FRONTEND_ORIGINS", "http://localhost:5173").split(",").map(&:strip)
    origin = request.headers["Origin"] || request.headers["Referer"]

    return if origin.blank?
    return if allowed.any? { |o| origin.start_with?(o) }

    render json: {
      data: nil,
      errors: [ { message: "Invalid origin", extensions: { code: "FORBIDDEN" } } ]
    }, status: :forbidden
  end

  def prepare_variables(variables_param)
    case variables_param
    when String
      variables_param.present? ? JSON.parse(variables_param) : {}
    when ActionController::Parameters
      variables_param.to_unsafe_h
    when Hash
      variables_param
    when nil
      {}
    else
      {}
    end
  rescue JSON::ParserError
    {}
  end
end
