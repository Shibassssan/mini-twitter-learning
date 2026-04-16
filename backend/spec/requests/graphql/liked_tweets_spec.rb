require "rails_helper"

RSpec.describe "GraphQL likedTweets", type: :request do
  let(:query) do
    <<~GRAPHQL
      query LikedTweets($first: Int) {
        likedTweets(first: $first) {
          edges {
            node {
              id
              content
              isLikedByMe
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }

  it "returns the authenticated user's liked tweets" do
    headers = sign_in_as(user)

    tweets = create_list(:tweet, 3)
    tweets.each { |tweet| create(:like, user: user, tweet: tweet) }

    post "/graphql", params: {
      query: query,
      variables: { first: 20 }.to_json,
      operationName: "LikedTweets"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "likedTweets", "edges").length).to eq(3)
  end

  it "returns empty when the user has no likes" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { first: 20 }.to_json,
      operationName: "LikedTweets"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "likedTweets", "edges")).to eq([])
    expect(body.dig("data", "likedTweets", "pageInfo", "hasNextPage")).to eq(false)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: {
      query: query,
      variables: { first: 20 }.to_json,
      operationName: "LikedTweets"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "likedTweets")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
