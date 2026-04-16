require "rails_helper"

RSpec.describe "GraphQL publicTimeline", type: :request do
  let(:query) do
    <<~GRAPHQL
      query PublicTimeline($first: Int!, $after: String) {
        publicTimeline(first: $first, after: $after) {
          edges {
            cursor
            node {
              id
              content
              author {
                username
              }
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
  let(:auth_headers) { sign_in_as(user) }

  it "returns tweets in reverse chronological order with pagination metadata" do
    older_tweet = create(:tweet, content: "older", created_at: 2.hours.ago, user: user)
    newer_tweet = create(:tweet, content: "newer", created_at: 1.hour.ago, user: user)

    post "/graphql", params: {
      query: query,
      variables: { first: 10 }.to_json,
      operationName: "PublicTimeline"
    }, headers: auth_headers

    body = JSON.parse(response.body)
    edges = body.dig("data", "publicTimeline", "edges")

    expect(body["errors"]).to be_nil
    expect(edges.map { |edge| edge.dig("node", "content") }).to eq([ newer_tweet.content, older_tweet.content ])
    expect(body.dig("data", "publicTimeline", "pageInfo", "hasNextPage")).to eq(false)
  end

  it "supports cursor-based pagination" do
    tweets = [
      create(:tweet, content: "tweet-1", created_at: 3.hours.ago, user: user),
      create(:tweet, content: "tweet-2", created_at: 2.hours.ago, user: user),
      create(:tweet, content: "tweet-3", created_at: 1.hour.ago, user: user)
    ]

    post "/graphql", params: {
      query: query,
      variables: { first: 2 }.to_json,
      operationName: "PublicTimeline"
    }, headers: auth_headers

    first_page = JSON.parse(response.body)
    end_cursor = first_page.dig("data", "publicTimeline", "pageInfo", "endCursor")

    post "/graphql", params: {
      query: query,
      variables: { first: 2, after: end_cursor }.to_json,
      operationName: "PublicTimeline"
    }, headers: auth_headers

    second_page = JSON.parse(response.body)
    second_page_edges = second_page.dig("data", "publicTimeline", "edges")

    expect(first_page.dig("data", "publicTimeline", "pageInfo", "hasNextPage")).to eq(true)
    expect(second_page_edges.length).to eq(1)
    expect(second_page_edges.first.dig("node", "content")).to eq(tweets.first.content)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: {
      query: query,
      variables: { first: 10 }.to_json,
      operationName: "PublicTimeline"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "publicTimeline")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
