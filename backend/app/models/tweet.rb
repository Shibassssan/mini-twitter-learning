class Tweet < ApplicationRecord
  include HasUuid

  belongs_to :user, counter_cache: true
  has_many :likes, dependent: :destroy

  validates :content,
    presence: true,
    length: { maximum: 300 }
end
