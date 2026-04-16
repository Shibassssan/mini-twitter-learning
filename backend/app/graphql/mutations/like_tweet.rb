module Mutations
  class LikeTweet < BaseMutation
    description "ツイートにいいねする"

    argument :tweet_uuid, ID, required: true

    type Types::TweetType

    def resolve(tweet_uuid:)
      user = authenticate!
      tweet = Tweet.find_by!(uuid: tweet_uuid)

      tweet = ActiveRecord::Base.transaction do
        Like.create!(user: user, tweet: tweet)
        tweet.reload
      end

      MiniTwitterSchema.subscriptions.trigger(
        :tweet_like_updated,
        { tweet_id: tweet.uuid },
        tweet,
        scope: tweet.uuid
      )

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
