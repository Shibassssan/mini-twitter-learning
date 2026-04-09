class Like < ApplicationRecord
  include HasUuid

  belongs_to :user
  belongs_to :tweet, counter_cache: true

  validates :user_id, uniqueness: { scope: :tweet_id, message: "has already liked this tweet" }
end
