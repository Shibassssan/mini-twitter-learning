require "rails_helper"

RSpec.describe "GraphQL unlikeTweet", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation UnlikeTweet($tweetUuid: ID!) {
        unlikeTweet(tweetUuid: $tweetUuid) {
          id
          content
          likesCount
          isLikedByMe
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }
  let(:tweet) { create(:tweet) }

  it "unlikes a previously liked tweet" do
    headers = sign_in_as(user)
    create(:like, user: user, tweet: tweet)

    expect do
      post "/graphql", params: {
        query: query,
        variables: { tweetUuid: tweet.uuid }.to_json,
        operationName: "UnlikeTweet"
      }, headers: headers
    end.to change(Like, :count).by(-1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "unlikeTweet", "isLikedByMe")).to eq(false)
    expect(body.dig("data", "unlikeTweet", "likesCount")).to eq(0)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: {
      query: query,
      variables: { tweetUuid: tweet.uuid }.to_json,
      operationName: "UnlikeTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["unlikeTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error when unliking a tweet not liked" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { tweetUuid: tweet.uuid }.to_json,
      operationName: "UnlikeTweet"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["data"]["unlikeTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
