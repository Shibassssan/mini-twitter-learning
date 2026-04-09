class User < ApplicationRecord
  include HasUuid

  has_one :credential, dependent: :destroy
  has_many :tweets, dependent: :destroy
  has_many :likes, dependent: :destroy

  has_many :active_follows, class_name: "Follow", foreign_key: :follower_id, dependent: :destroy
  has_many :passive_follows, class_name: "Follow", foreign_key: :followed_id, dependent: :destroy
  has_many :following, through: :active_follows, source: :followed
  has_many :followers, through: :passive_follows, source: :follower

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
end
