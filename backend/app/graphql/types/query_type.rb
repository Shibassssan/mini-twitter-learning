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
    field :liked_tweets, Types::TweetConnectionType, null: false, connection: false, description: "自分がいいねしたツイート一覧" do
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end
    field :followers, Types::UserConnectionType, null: false, connection: false, description: "指定ユーザーのフォロワー一覧" do
      argument :uuid, ID, required: true
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end
    field :following, Types::UserConnectionType, null: false, connection: false, description: "指定ユーザーのフォロー中一覧" do
      argument :uuid, ID, required: true
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end
    field :user_by_username, Types::UserType, null: false, description: "ユーザー名でユーザー情報を取得" do
      argument :username, String, required: true
    end
    field :search_users, Types::UserConnectionType, null: false, connection: false, description: "ユーザー検索（username / display_name 部分一致）" do
      argument :query, String, required: true
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end
    field :search_tweets, Types::TweetConnectionType, null: false, connection: false, description: "ツイート検索（content 部分一致）" do
      argument :query, String, required: true
      argument :first, Integer, required: false, default_value: ConnectionHelper::DEFAULT_PAGE_SIZE
      argument :after, String, required: false
    end

    def me
      context[:current_user] || raise_unauthenticated!
    end

    def timeline(first:, after: nil)
      current_user = context[:current_user] || raise_unauthenticated!

      followed_ids = Follow.where(follower_id: current_user.id).select(:followed_id)
      relation = Tweet.where(user_id: followed_ids).includes(:user)
      paginate_relation(relation, first: first, after: after)
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

    def liked_tweets(first:, after: nil)
      current_user = context[:current_user] || raise_unauthenticated!

      tweet_ids = current_user.likes.order(created_at: :desc).select(:tweet_id)
      relation = Tweet.where(id: tweet_ids).includes(:user)
      paginate_relation(relation, first: first, after: after)
    end

    def followers(uuid:, first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      user = User.find_by!(uuid: uuid)
      follower_ids = Follow.where(followed_id: user.id).select(:follower_id)
      relation = User.where(id: follower_ids)
      paginate_relation(relation, first: first, after: after)
    end

    def following(uuid:, first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      user = User.find_by!(uuid: uuid)
      followed_ids = Follow.where(follower_id: user.id).select(:followed_id)
      relation = User.where(id: followed_ids)
      paginate_relation(relation, first: first, after: after)
    end

    def user_by_username(username:)
      context[:current_user] || raise_unauthenticated!

      User.find_by!(username: username)
    end

    def search_users(query:, first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      raise_validation_error!("Search query must be at least 1 character") if query.strip.blank?

      sanitized = ActiveRecord::Base.sanitize_sql_like(query.strip)
      relation = User.where("username ILIKE :q OR display_name ILIKE :q", q: "%#{sanitized}%")
      paginate_relation(relation, first: first, after: after)
    end

    def search_tweets(query:, first:, after: nil)
      context[:current_user] || raise_unauthenticated!

      raise_validation_error!("Search query must be at least 1 character") if query.strip.blank?

      sanitized = ActiveRecord::Base.sanitize_sql_like(query.strip)
      relation = Tweet.where("content ILIKE :q", q: "%#{sanitized}%").includes(:user)
      paginate_relation(relation, first: first, after: after)
    end
  end
end
