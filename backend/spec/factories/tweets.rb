FactoryBot.define do
  factory :tweet do
    association :user
    sequence(:content) { |n| "Tweet content #{n}" }
  end
end
