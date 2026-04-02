require "rails_helper"

RSpec.describe Credential, type: :model do
  subject(:credential) { create(:credential) }

  it { is_expected.to belong_to(:user) }
  it { is_expected.to validate_presence_of(:email) }
  it { is_expected.to validate_uniqueness_of(:email) }

  it "requires a valid email format" do
    credential.email = "invalid-email"

    expect(credential).not_to be_valid
    expect(credential.errors[:email]).to be_present
  end

  it "requires passwords to be at least 8 characters" do
    credential.password = "short"
    credential.password_confirmation = "short"

    expect(credential).not_to be_valid
    expect(credential.errors[:password]).to be_present
  end
end
