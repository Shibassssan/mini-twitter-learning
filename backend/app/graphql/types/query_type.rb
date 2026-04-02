module Types
  class QueryType < Types::BaseObject
    include GraphqlErrorHelper
    include ConnectionHelper

    field :me, Types::UserType, null: true, description: "ログイン中のユーザー情報を返す"
    field :timeline, Types::TweetConnectionType, null: false, connection: false, description: "フォロー中ユーザーのタイムライン" do
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end
    field :public_timeline, Types::TweetConnectionType, null: false, connection: false, description: "全体タイムライン" do
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end
    field :user_tweets, Types::TweetConnectionType, null: false, connection: false, description: "指定ユーザーのツイート一覧" do
      argument :uuid, ID, required: true
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end

    def me
      context[:current_user] || raise_unauthenticated!
    end

    def timeline(first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      # Follow relationships arrive in Phase 3, so the following timeline
      # intentionally stays empty until those records exist.
      paginate_relation(Tweet.none, first: first, after: after)
    end

    def public_timeline(first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      paginate_relation(Tweet.includes(:user), first: first, after: after)
    end

    def user_tweets(uuid:, first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      user = User.find_by!(uuid: uuid)
      paginate_relation(user.tweets.includes(:user), first: first, after: after)
    end
  end
end
