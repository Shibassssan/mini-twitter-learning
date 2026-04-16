module Mutations
  class LikeTweet < BaseMutation
    description "ツイートにいいねする"

    argument :tweet_uuid, ID, required: true

    type Types::TweetType

    def resolve(tweet_uuid:)
      user = authenticate!
      tweet = Tweet.find_by!(uuid: tweet_uuid)

      tweet = user.like_tweet!(tweet)

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
      raise_not_found!("Tweet not found")
    rescue ActiveRecord::RecordNotUnique
      raise_validation_error!("Already liked this tweet")
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    end
  end
end
