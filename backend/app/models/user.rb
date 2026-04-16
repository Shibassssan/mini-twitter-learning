class User < ApplicationRecord
  NotAuthorizedToModifyTweet = Class.new(StandardError)

  include HasUuid
  include AvatarUploadable
  include TextSearchable

  has_one :credential, dependent: :destroy
  has_many :tweets, dependent: :destroy
  has_many :likes, dependent: :destroy

  has_many :active_follows, class_name: "Follow", foreign_key: :follower_id, dependent: :destroy
  has_many :passive_follows, class_name: "Follow", foreign_key: :followed_id, dependent: :destroy
  has_many :following, through: :active_follows, source: :followed
  has_many :followers, through: :passive_follows, source: :follower

  has_one_attached :avatar

  validates :username,
    presence: true,
    uniqueness: true,
    length: { minimum: 3, maximum: 15 },
    format: { with: /\A[a-zA-Z0-9_]+\z/, message: "can only contain letters, numbers, and underscores" }

  validates :display_name,
    presence: true,
    length: { maximum: 50 }

  validates :bio,
    length: { maximum: 200 },
    allow_nil: true

  def following?(other_user)
    active_follows.exists?(followed_id: other_user.id)
  end

  def self.search_profiles_substring(query_string)
    pattern = normalize_search_query!(query_string)
    with_attached_avatar.where("username ILIKE :q OR display_name ILIKE :q", q: pattern)
  end

  def following_timeline_tweets
    followed_ids = Follow.where(follower_id: id).select(:followed_id)
    Tweet.where(user_id: followed_ids)
  end

  def follow!(other_user)
    ActiveRecord::Base.transaction do
      active_follows.create!(followed: other_user)
      other_user.reload
    end
  end

  def unfollow!(other_user)
    ActiveRecord::Base.transaction do
      active_follows.find_by!(followed: other_user).destroy!
      other_user.reload
    end
  end

  def like_tweet!(tweet)
    ActiveRecord::Base.transaction do
      likes.create!(tweet: tweet)
      tweet.reload
    end
  end

  def unlike_tweet!(tweet)
    ActiveRecord::Base.transaction do
      likes.find_by!(tweet: tweet).destroy!
      tweet.reload
    end
  end

  def post_tweet!(content)
    ActiveRecord::Base.transaction do
      tweets.create!(content: content.to_s.strip)
    end
  end

  def destroy_tweet_by_uuid!(uuid)
    ActiveRecord::Base.transaction do
      tweet = Tweet.find_by!(uuid: uuid)
      raise NotAuthorizedToModifyTweet if tweet.user_id != id

      tweet.destroy!
    end
    true
  end

  def update_profile!(permitted)
    permitted = permitted.symbolize_keys.slice(:display_name, :bio)
    raise ArgumentError, "No attributes to update" if permitted.empty?

    ActiveRecord::Base.transaction do
      update!(permitted)
    end
    self
  end

  # GraphQL の follows カーソルページング用（follows.created_at / follows.id）
  def following_users_cursor_relation
    self.class
      .with_attached_avatar
      .joins("INNER JOIN follows ON follows.followed_id = users.id")
      .where(follows: { follower_id: id })
      .select(cursor_select_sql)
  end

  def followers_users_cursor_relation
    self.class
      .with_attached_avatar
      .joins("INNER JOIN follows ON follows.follower_id = users.id")
      .where(follows: { followed_id: id })
      .select(cursor_select_sql)
  end

  # GraphQL の likes カーソルページング用（likes.created_at / likes.id）
  def liked_tweets_cursor_relation
    Tweet
      .joins(:likes)
      .where(likes: { user_id: id })
      .select(liked_tweets_cursor_select_sql)
  end

  private

  def cursor_select_sql
    "users.*, follows.created_at AS cursor_created_at, follows.id AS cursor_id"
  end

  def liked_tweets_cursor_select_sql
    "tweets.*, likes.created_at AS cursor_created_at, likes.id AS cursor_id"
  end
end
