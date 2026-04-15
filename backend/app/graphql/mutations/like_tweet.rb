module Mutations
  class LikeTweet < BaseMutation
    description "ツイートにいいねする"

    argument :tweet_uuid, ID, required: true

    type Types::TweetType

    def resolve(tweet_uuid:)
      user = context[:current_user] || raise_unauthenticated!
      tweet = Tweet.find_by!(uuid: tweet_uuid)

      ActiveRecord::Base.transaction do
        Like.create!(user: user, tweet: tweet)
        tweet.reload
      end
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Tweet not found")
    rescue ActiveRecord::RecordNotUnique
      raise_validation_error!("Already liked this tweet")
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    rescue StandardError
      raise_validation_error!("Failed to like tweet")
    end
  end
end
