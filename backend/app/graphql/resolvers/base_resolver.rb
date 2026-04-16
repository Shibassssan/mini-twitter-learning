module Resolvers
  class BaseResolver < GraphQL::Schema::Resolver
    include GraphqlErrorHelper
    include ConnectionHelper

    private

    def authenticate!
      context[:current_user] || raise_unauthenticated!
    end
  end
end
