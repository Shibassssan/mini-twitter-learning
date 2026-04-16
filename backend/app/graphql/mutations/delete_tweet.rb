module Mutations
  class DeleteTweet < BaseMutation
    description "自分のツイートを削除する"

    argument :uuid, ID, required: true

    type Boolean

    def resolve(uuid:)
      user = authenticate!

      user.destroy_tweet_by_uuid!(uuid)
    rescue User::NotAuthorizedToModifyTweet
      raise_authorization_error!
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Tweet not found")
    end
  end
end
