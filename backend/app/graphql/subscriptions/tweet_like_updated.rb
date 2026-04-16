# frozen_string_literal: true

module Subscriptions
  class TweetLikeUpdated < GraphQL::Schema::Subscription
    description "指定ツイートのいいね数・状態が変わったときに通知"

    subscription_scope :tweet_id

    argument :tweet_id, ID, required: true

    type Types::TweetType, null: false

    def authorized?(tweet_id:)
      context[:current_user].present?
    end

    def subscribe(tweet_id:)
      context[:tweet_id] = tweet_id
      :no_response
    end
  end
end
