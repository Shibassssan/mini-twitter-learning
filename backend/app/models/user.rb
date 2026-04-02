class User < ApplicationRecord
  include HasUuid

  has_one :credential, dependent: :destroy

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
end
