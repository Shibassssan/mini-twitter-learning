module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    include GraphqlErrorHelper

    argument_class Types::BaseArgument
    field_class Types::BaseField
    object_class Types::BaseObject

    private

    def authenticate!
      context[:current_user] || raise_unauthenticated!
    end

    def set_refresh_cookie!(refresh_token)
      response = context[:response]
      raise GraphQL::ExecutionError, "Response context is missing" unless response

      response.set_cookie(
        JWTSessions.refresh_cookie,
        AuthService.refresh_cookie_options(refresh_token)
      )
    end
  end
end
