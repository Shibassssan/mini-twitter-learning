module Resolvers
  class UserTweets < BaseResolver
    type Types::TweetConnectionType, null: false
    description "指定ユーザーのツイート一覧"

    argument :uuid, ID, required: true
    argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
    argument :after, String, required: false

    def resolve(uuid:, first:, after: nil)
      authenticate!

      user = User.find_by!(uuid: uuid)
      paginate_relation(user.tweets, first: first, after: after)
    rescue GraphQL::ExecutionError
      raise
    rescue ActiveRecord::RecordNotFound
      raise_not_found!("User not found")
    end
  end
end
