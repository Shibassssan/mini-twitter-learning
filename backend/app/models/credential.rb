class Credential < ApplicationRecord
  include HasUuid

  belongs_to :user

  has_secure_password

  validates :password, length: { minimum: 8 }, allow_nil: true

  validates :email,
    presence: true,
    uniqueness: true,
    format: { with: URI::MailTo::EMAIL_REGEXP }
end
