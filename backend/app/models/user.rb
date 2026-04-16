class User < ApplicationRecord
  include HasUuid

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
