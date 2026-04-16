require "rails_helper"

RSpec.describe "GraphQL likeTweet", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation LikeTweet($tweetUuid: ID!) {
        likeTweet(tweetUuid: $tweetUuid) {
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

  it "likes a tweet for the current user" do
    headers = sign_in_as(user)

    expect do
      post "/graphql", params: {
        query: query,
        variables: { tweetUuid: tweet.uuid }.to_json,
        operationName: "LikeTweet"
      }, headers: headers
    end.to change(Like, :count).by(1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "likeTweet", "isLikedByMe")).to eq(true)
    expect(body.dig("data", "likeTweet", "likesCount")).to eq(1)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: {
      query: query,
      variables: { tweetUuid: tweet.uuid }.to_json,
      operationName: "LikeTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["likeTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a validation error for a duplicate like" do
    headers = sign_in_as(user)
    create(:like, user: user, tweet: tweet)

    post "/graphql", params: {
      query: query,
      variables: { tweetUuid: tweet.uuid }.to_json,
      operationName: "LikeTweet"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["data"]["likeTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end

  it "returns a not found error for an invalid tweet uuid" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { tweetUuid: "nonexistent-uuid" }.to_json,
      operationName: "LikeTweet"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["data"]["likeTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
