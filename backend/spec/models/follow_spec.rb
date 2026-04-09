require "rails_helper"

RSpec.describe Follow, type: :model do
  subject(:follow) { build(:follow) }

  it { is_expected.to belong_to(:follower).class_name("User").counter_cache(:following_count) }
  it { is_expected.to belong_to(:followed).class_name("User").counter_cache(:followers_count) }
  it { is_expected.to validate_uniqueness_of(:follower_id).scoped_to(:followed_id).with_message("is already following this user") }

  it "generates a uuid before create" do
    expect(create(:follow).uuid).to be_present
  end

  it "prevents a user from following themselves" do
    user = create(:user)
    follow = build(:follow, follower: user, followed: user)

    expect(follow).not_to be_valid
    expect(follow.errors[:follower_id]).to be_present
  end
end
