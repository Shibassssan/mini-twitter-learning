class MiniTwitterSchema < GraphQL::Schema
  use GraphQL::Dataloader

  mutation(Types::MutationType)
  query(Types::QueryType)

  max_depth 10
  max_complexity 200

  rescue_from ActiveRecord::RecordInvalid do |error|
    raise GraphQL::ExecutionError.new(
      error.record.errors.full_messages.join(", "),
      extensions: { code: "VALIDATION_ERROR" }
    )
  end

  rescue_from ActiveRecord::RecordNotFound do
    raise GraphQL::ExecutionError.new(
      "Resource not found",
      extensions: { code: "NOT_FOUND" }
    )
  end

  rescue_from JWTSessions::Errors::Unauthorized do
    raise GraphQL::ExecutionError.new(
      "Authentication required",
      extensions: { code: "AUTHENTICATION_ERROR" }
    )
  end

  def self.unauthorized_object(error)
    raise GraphQL::ExecutionError.new(
      "Unauthorized",
      extensions: { code: "AUTHORIZATION_ERROR" }
    )
  end
end
