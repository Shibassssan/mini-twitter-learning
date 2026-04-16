module Mutations
  class UnlikeTweet < BaseMutation
    description "ツイートのいいねを取り消す"

    argument :tweet_uuid, ID, required: true

    type Types::TweetType

    def resolve(tweet_uuid:)
      user = authenticate!
      tweet = Tweet.find_by!(uuid: tweet_uuid)

      tweet = user.unlike_tweet!(tweet)

      begin
        MiniTwitterSchema.subscriptions.trigger(
          :tweet_like_updated,
          { tweet_id: tweet.uuid },
          tweet,
          scope: tweet.uuid
        )
      rescue => e
        Rails.logger.error("Subscription broadcast failed (tweet_like_updated): #{e.class}: #{e.message}")
      end

      tweet
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Like not found")
    end
  end
end
