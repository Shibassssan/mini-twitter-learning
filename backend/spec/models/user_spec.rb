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

  describe ".search_profiles_substring" do
    it "raises when the query is shorter than 3 characters" do
      expect { User.search_profiles_substring("ab") }.to raise_error(ArgumentError)
    end

    it "returns users matching username or display name" do
      matching = create(:user, username: "searchalice", display_name: "A")
      create(:user, username: "other", display_name: "B")

      expect(User.search_profiles_substring("search")).to contain_exactly(matching)
    end
  end

  describe "#following_timeline_tweets" do
    let(:alice) { create(:user) }
    let(:bob) { create(:user) }
    let!(:tweet_from_bob) { create(:tweet, user: bob) }

    before { create(:follow, follower: alice, followed: bob) }

    it "returns tweets from followed users only" do
      other = create(:user)
      create(:tweet, user: other)

      expect(alice.following_timeline_tweets).to contain_exactly(tweet_from_bob)
    end
  end

  describe "#follow! and #unfollow!" do
    let(:alice) { create(:user) }
    let(:bob) { create(:user) }

    it "creates a follow and reloads the followed user" do
      expect { alice.follow!(bob) }.to change(Follow, :count).by(1)
      expect(bob.reload.followers_count).to eq(1)
    end

    it "destroys the follow relationship" do
      create(:follow, follower: alice, followed: bob)
      expect { alice.unfollow!(bob) }.to change(Follow, :count).by(-1)
    end
  end

  describe "#like_tweet! and #unlike_tweet!" do
    let(:alice) { create(:user) }
    let(:tweet) { create(:tweet) }

    it "creates and removes a like" do
      expect { alice.like_tweet!(tweet) }.to change(Like, :count).by(1)
      expect { alice.unlike_tweet!(tweet) }.to change(Like, :count).by(-1)
    end
  end

  describe "#post_tweet!" do
    let(:alice) { create(:user) }

    it "strips content and assigns the user" do
      t = alice.post_tweet!("  hello  ")
      expect(t.content).to eq("hello")
      expect(t.user).to eq(alice)
    end
  end

  describe "#destroy_tweet_by_uuid!" do
    let(:alice) { create(:user) }
    let(:bob) { create(:user) }
    let!(:tweet) { create(:tweet, user: alice) }

    it "destroys the user's own tweet" do
      expect { alice.destroy_tweet_by_uuid!(tweet.uuid) }.to change(Tweet, :count).by(-1)
    end

    it "raises NotAuthorizedToModifyTweet when the tweet belongs to someone else" do
      expect {
        bob.destroy_tweet_by_uuid!(tweet.uuid)
      }.to raise_error(User::NotAuthorizedToModifyTweet)
    end
  end

  describe "#update_profile!" do
    let(:alice) { create(:user, display_name: "Old") }

    it "updates allowed attributes" do
      alice.update_profile!({ "display_name" => "New" })
      expect(alice.reload.display_name).to eq("New")
    end

    it "raises when there are no attributes to apply" do
      expect { alice.update_profile!({}) }.to raise_error(ArgumentError, "No attributes to update")
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
