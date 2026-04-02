class MiniTwitterSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)

  max_depth 10
  max_complexity 200

  def self.unauthorized_object(error)
    raise GraphQL::ExecutionError.new(
      "Unauthorized",
      extensions: { code: "AUTHORIZATION_ERROR" }
    )
  end
end
