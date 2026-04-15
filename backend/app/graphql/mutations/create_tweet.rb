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
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordInvalid => e
      raise_validation_error!(e.record.errors.full_messages.join(", "))
    rescue StandardError
      raise_validation_error!("Failed to create tweet")
    end
  end
end
