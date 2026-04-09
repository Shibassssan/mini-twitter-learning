require "rails_helper"

RSpec.describe Like, type: :model do
  subject(:like) { build(:like) }

  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:tweet).counter_cache(true) }
  it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:tweet_id).with_message("has already liked this tweet") }

  it "generates a uuid before create" do
    expect(create(:like).uuid).to be_present
  end
end
