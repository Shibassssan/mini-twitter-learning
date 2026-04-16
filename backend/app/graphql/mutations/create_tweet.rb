module Mutations
  class CreateTweet < BaseMutation
    description "新しいツイートを投稿する"

    argument :content, String, required: true

    type Types::TweetType

    def resolve(content:)
      user = authenticate!

      tweet = ActiveRecord::Base.transaction do
        Tweet.create!(
          user: user,
          content: content.strip
        )
      end

      MiniTwitterSchema.subscriptions.trigger(:tweet_added, {}, tweet)

      tweet
    end
  end
end
