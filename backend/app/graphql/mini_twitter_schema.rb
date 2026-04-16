class MiniTwitterSchema < GraphQL::Schema
  use GraphQL::Dataloader
  use GraphQL::Subscriptions::ActionCableSubscriptions

  mutation(Types::MutationType)
  query(Types::QueryType)
  subscription(Types::SubscriptionType)

  max_depth 10
  max_complexity 200

  disable_introspection_entry_points unless Rails.env.development? || Rails.env.test?

  rescue_from ActiveRecord::RecordInvalid do |error|
    raise GraphQL::ExecutionError.new(
      error.record.errors.full_messages.join(", "),
      extensions: { code: "VALIDATION_ERROR" }
    )
  end

  rescue_from ActiveRecord::RecordNotUnique do
    raise GraphQL::ExecutionError.new(
      "Already exists",
      extensions: { code: "VALIDATION_ERROR" }
    )
  end

  rescue_from ActiveRecord::InvalidForeignKey do
    raise GraphQL::ExecutionError.new(
      "Referenced resource no longer exists",
      extensions: { code: "NOT_FOUND" }
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

  rescue_from StandardError do |error|
    Rails.logger.error("Unexpected GraphQL error: #{error.class}: #{error.message}\n#{error.backtrace&.first(5)&.join("\n")}")
    raise GraphQL::ExecutionError.new(
      "Internal server error",
      extensions: { code: "INTERNAL_SERVER_ERROR" }
    )
  end

  def self.unauthorized_object(error)
    raise GraphQL::ExecutionError.new(
      "Unauthorized",
      extensions: { code: "AUTHORIZATION_ERROR" }
    )
  end
end
