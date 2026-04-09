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
    end
  end
end
