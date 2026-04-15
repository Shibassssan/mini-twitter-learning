module Mutations
  class DeleteTweet < BaseMutation
    description "自分のツイートを削除する"

    argument :uuid, ID, required: true

    type Boolean

    def resolve(uuid:)
      user = context[:current_user] || raise_unauthenticated!

      ActiveRecord::Base.transaction do
        tweet = Tweet.lock.find_by!(uuid: uuid)
        raise_authorization_error! unless tweet.user_id == user.id

        tweet.destroy!
      end

      true
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Tweet not found")
    rescue StandardError
      raise_validation_error!("Failed to delete tweet")
    end
  end
end
