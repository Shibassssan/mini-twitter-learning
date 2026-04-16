require "rails_helper"

RSpec.describe Tweet, type: :model do
  subject(:tweet) { build(:tweet) }

  it { is_expected.to belong_to(:user).counter_cache(true) }
  it { is_expected.to validate_presence_of(:content) }
  it { is_expected.to validate_length_of(:content).is_at_most(300) }

  it "rejects content made only of whitespace" do
    tweet.content = "   "

    expect(tweet).not_to be_valid
    expect(tweet.errors[:content]).to be_present
  end

  it "generates a uuid before create" do
    expect(create(:tweet).uuid).to be_present
  end

  describe ".search_content_substring" do
    it "raises when the query is shorter than 3 characters" do
      expect { Tweet.search_content_substring("x") }.to raise_error(ArgumentError)
    end

    it "returns tweets whose content matches the pattern" do
      matching = create(:tweet, content: "unique needle xyz")
      create(:tweet, content: "other body")

      expect(Tweet.search_content_substring("needle")).to contain_exactly(matching)
    end
  end
end
