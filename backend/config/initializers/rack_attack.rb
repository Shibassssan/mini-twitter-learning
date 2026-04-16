class Rack::Attack
  rack_attack_store =
    if Rails.cache.is_a?(ActiveSupport::Cache::NullStore)
      ActiveSupport::Cache::MemoryStore.new
    else
      Rails.cache
    end

  Rack::Attack.cache.store = rack_attack_store

  throttled_responder = lambda do |_request|
    body = {
      data: nil,
      errors: [
        {
          message: "Rate limit exceeded",
          extensions: { code: "RATE_LIMITED" }
        }
      ]
    }.to_json

    [ 429, { "Content-Type" => "application/json" }, [ body ] ]
  end

  self.throttled_responder = throttled_responder

  throttle("graphql/auth", limit: 5, period: 1.minute) do |req|
    next unless Rack::Attack.send(:graphql_operation?, req, %w[SignUp SignIn RefreshToken signUp signIn refreshToken])

    req.ip
  end

  throttle("graphql/create_tweet", limit: 30, period: 1.minute) do |req|
    next unless Rack::Attack.send(:graphql_operation?, req, %w[CreateTweet createTweet])

    req.ip
  end

  AUTH_GRAPHQL_OPS = %w[SignUp SignIn RefreshToken signUp signIn refreshToken].freeze

  throttle("graphql/general", limit: 120, period: 1.minute) do |req|
    next unless req.post? && req.path == "/graphql"
    next if Rack::Attack.send(:graphql_operation?, req, AUTH_GRAPHQL_OPS)

    req.ip
  end

  throttle("graphql/search", limit: 30, period: 1.minute) do |req|
    next unless Rack::Attack.send(:graphql_operation?, req, %w[SearchTweets SearchUsers searchTweets searchUsers])

    req.ip
  end

  throttle("graphql/social", limit: 60, period: 1.minute) do |req|
    next unless Rack::Attack.send(:graphql_operation?, req, %w[
      FollowUser UnfollowUser LikeTweet UnlikeTweet
      followUser unfollowUser likeTweet unlikeTweet
    ])

    req.ip
  end

  class << self
    private

    def graphql_operation?(req, operation_names)
      return false unless req.post? && req.path == "/graphql"

      operation_name = req.params["operationName"]
      query = req.params["query"].to_s

      operation_names.include?(operation_name) || operation_names.any? { |name| query.include?(name) }
    rescue StandardError
      false
    end
  end
end
