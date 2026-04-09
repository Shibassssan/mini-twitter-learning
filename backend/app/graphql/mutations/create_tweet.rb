module Mutations
  class CreateTweet < BaseMutation
    description "新しいツイートを投稿する"

    argument :content, String, required: true

    type Types::TweetType

    def resolve(content:)
      user = context[:current_user] || raise_unauthenticated!

      ActiveRecord::Base.transaction do
        Tweet.create!(
          user: user,
          content: content.strip
        )
      end
    end
  end
end
