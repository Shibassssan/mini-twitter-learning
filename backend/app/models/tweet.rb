class Tweet < ApplicationRecord
  include HasUuid

  belongs_to :user, counter_cache: true

  validates :content,
    presence: true,
    length: { maximum: 300 }
end
