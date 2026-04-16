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

  describe "#following_users_cursor_relation" do
    let(:target) { create(:user) }
    let(:followed_accounts) { create_list(:user, 2) }

    before do
      followed_accounts.each { |u| create(:follow, follower: target, followed: u) }
    end

    it "returns users the target follows, with follow row cursor fields" do
      rel = target.following_users_cursor_relation

      expect(rel).to be_a(ActiveRecord::Relation)
      expect(rel.klass).to eq(User)
      expect(rel.map(&:id)).to match_array(followed_accounts.map(&:id))

      row = rel.order(:id).first
      expect(row.cursor_created_at).to be_present
      expect(row.cursor_id).to be_present
    end
  end

  describe "#followers_users_cursor_relation" do
    let(:target) { create(:user) }
    let(:follower_accounts) { create_list(:user, 2) }

    before do
      follower_accounts.each { |u| create(:follow, follower: u, followed: target) }
    end

    it "returns users who follow the target, with follow row cursor fields" do
      rel = target.followers_users_cursor_relation

      expect(rel.map(&:id)).to match_array(follower_accounts.map(&:id))

      row = rel.order(:id).first
      expect(row.cursor_created_at).to be_present
      expect(row.cursor_id).to be_present
    end
  end

  describe "#liked_tweets_cursor_relation" do
    let(:user) { create(:user) }
    let(:tweets) { create_list(:tweet, 2) }

    before do
      tweets.each { |t| create(:like, user: user, tweet: t) }
    end

    it "returns tweets the user liked, with like row cursor fields" do
      rel = user.liked_tweets_cursor_relation

      expect(rel).to be_a(ActiveRecord::Relation)
      expect(rel.klass).to eq(Tweet)
      expect(rel.map(&:id)).to match_array(tweets.map(&:id))

      row = rel.order(:id).first
      expect(row.cursor_created_at).to be_present
      expect(row.cursor_id).to be_present
    end
  end
end
