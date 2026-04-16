module Mutations
  class CreateTweet < BaseMutation
    description "新しいツイートを投稿する"

    argument :content, String, required: true

    type Types::TweetType

    def resolve(content:)
      user = authenticate!

      tweet = user.post_tweet!(content)

      begin
        MiniTwitterSchema.subscriptions.trigger(:tweet_added, {}, tweet)
      rescue => e
        Rails.logger.error("Subscription broadcast failed (tweet_added): #{e.class}: #{e.message}")
      end

      tweet
    end
  end
end
