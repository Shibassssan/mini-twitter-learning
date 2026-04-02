FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user_#{n}" }
    sequence(:display_name) { |n| "User #{n}" }
    bio { "Bio for testing" }
  end
end
