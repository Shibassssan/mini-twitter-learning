module Mutations
  class UnlikeTweet < BaseMutation
    description "ツイートのいいねを取り消す"

    argument :tweet_uuid, ID, required: true

    type Types::TweetType

    def resolve(tweet_uuid:)
      user = context[:current_user] || raise_unauthenticated!
      tweet = Tweet.find_by!(uuid: tweet_uuid)

      ActiveRecord::Base.transaction do
        like = Like.find_by!(user: user, tweet: tweet)
        like.destroy!
        tweet.reload
      end
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Like not found")
    rescue StandardError
      raise_validation_error!("Failed to unlike tweet")
    end
  end
end
