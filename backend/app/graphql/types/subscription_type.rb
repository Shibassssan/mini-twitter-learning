# frozen_string_literal: true

module Types
  class SubscriptionType < Types::BaseObject
    field :tweet_added, subscription: Subscriptions::TweetAdded
    field :tweet_like_updated, subscription: Subscriptions::TweetLikeUpdated
  end
end
