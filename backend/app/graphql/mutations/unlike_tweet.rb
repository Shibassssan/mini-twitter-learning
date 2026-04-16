module Mutations
  class UnlikeTweet < BaseMutation
    description "ツイートのいいねを取り消す"

    argument :tweet_uuid, ID, required: true

    type Types::TweetType

    def resolve(tweet_uuid:)
      user = authenticate!
      tweet = Tweet.find_by!(uuid: tweet_uuid)

      tweet = ActiveRecord::Base.transaction do
        like = Like.find_by!(user: user, tweet: tweet)
        like.destroy!
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
      raise_not_found!("Like not found")
    end
  end
end
