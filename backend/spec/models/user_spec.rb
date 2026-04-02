require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  it { is_expected.to have_one(:credential).dependent(:destroy) }
  it { is_expected.to validate_presence_of(:username) }
  it { is_expected.to validate_presence_of(:display_name) }
  it { is_expected.to validate_length_of(:username).is_at_least(3).is_at_most(15) }
  it { is_expected.to validate_length_of(:display_name).is_at_most(50) }
  it { is_expected.to validate_length_of(:bio).is_at_most(200) }

  it "requires usernames to use letters, numbers, and underscores only" do
    user.username = "bad username"

    expect(user).not_to be_valid
    expect(user.errors[:username]).to be_present
  end

  it "generates a uuid before create" do
    expect(create(:user).uuid).to be_present
  end
end
