# frozen_string_literal: true

module Subscriptions
  class TweetAdded < GraphQL::Schema::Subscription
    description "新しいツイートが投稿されたときに通知"

    type Types::TweetType, null: false

    def authorized?
      context[:current_user].present?
    end

    def subscribe
      :no_response
    end
  end
end
