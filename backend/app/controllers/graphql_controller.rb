class GraphqlController < ApplicationController
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
