# frozen_string_literal: true

class GraphqlChannel < ApplicationCable::Channel
  WS_RATE_LIMIT = 120
  WS_RATE_PERIOD = 60

  def subscribed
    @subscription_ids = []
  end

  def execute(data)
    unless connection.current_user
      transmit(ws_error_payload("Authentication required", "AUTHENTICATION_ERROR"))
      return
    end

    if ws_rate_limited?
      transmit(ws_error_payload("Rate limit exceeded", "RATE_LIMITED"))
      return
    end

    query = data["query"]

    unless subscription_operation?(query)
      transmit({ result: { errors: [{ message: "Only subscriptions are allowed over WebSocket" }] }, more: false })
      return
    end

    variables = ensure_hash(data["variables"])
    operation_name = data["operationName"]

    result = MiniTwitterSchema.execute(
      query,
      variables: variables,
      operation_name: operation_name,
      context: {
        channel: self,
        current_user: connection.current_user,
        controller: nil,
        request: nil,
        response: nil,
        cookies: nil
      }
    )

    payload = {
      result: result.to_h,
      more: result.subscription?
    }

    if result.context[:subscription_id]
      @subscription_ids << result.context[:subscription_id]
    end

    transmit(payload)
  end

  def unsubscribed
    @subscription_ids.each do |sid|
      MiniTwitterSchema.subscriptions.delete_subscription(sid)
    end
  end

  private

  def ws_error_payload(message, code)
    {
      result: {
        errors: [
          {
            message: message,
            extensions: { code: code }
          }
        ]
      },
      more: false
    }
  end

  def ws_rate_limited?
    bucket = Time.current.to_i / WS_RATE_PERIOD
    key = "ws_graphql_exec:#{connection.current_user.id}:#{bucket}"
    count = Rails.cache.read(key).to_i + 1
    Rails.cache.write(key, count, expires_in: (WS_RATE_PERIOD * 2).seconds)
    count > WS_RATE_LIMIT
  end

  def subscription_operation?(query)
    parsed = GraphQL.parse(query.to_s)
    operation = parsed.definitions.first
    operation.is_a?(GraphQL::Language::Nodes::OperationDefinition) &&
      operation.operation_type == "subscription"
  rescue GraphQL::ParseError
    false
  end

  def ensure_hash(ambiguous_param)
    case ambiguous_param
    when String
      if ambiguous_param.present?
        ensure_hash(JSON.parse(ambiguous_param))
      else
        {}
      end
    when Hash
      ambiguous_param
    when ActionController::Parameters
      ambiguous_param.to_unsafe_h
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{ambiguous_param}"
    end
  end
end
