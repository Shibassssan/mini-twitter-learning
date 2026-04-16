module Mutations
  class DeleteTweet < BaseMutation
    description "自分のツイートを削除する"

    argument :uuid, ID, required: true

    type Boolean

    def resolve(uuid:)
      user = authenticate!

      ActiveRecord::Base.transaction do
        tweet = Tweet.find_by!(uuid: uuid)
        raise_authorization_error! unless tweet.user_id == user.id

        tweet.destroy!
      end

      true
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("Tweet not found")
    end
  end
end
