module GraphqlErrorHelper
  private

  def raise_unauthenticated!
    raise GraphQL::ExecutionError.new(
      "Authentication required",
      extensions: { code: "AUTHENTICATION_ERROR" }
    )
  end

  def raise_authorization_error!
    raise GraphQL::ExecutionError.new(
      "Not authorized",
      extensions: { code: "AUTHORIZATION_ERROR" }
    )
  end

  def raise_not_found!(message = "Resource not found")
    raise GraphQL::ExecutionError.new(
      message,
      extensions: { code: "NOT_FOUND" }
    )
  end

  def raise_validation_error!(message)
    raise GraphQL::ExecutionError.new(
      message,
      extensions: { code: "VALIDATION_ERROR" }
    )
  end
end
