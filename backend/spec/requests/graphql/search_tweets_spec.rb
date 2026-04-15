require "rails_helper"

RSpec.describe "GraphQL searchTweets", type: :request do
  let(:query) do
    <<~GRAPHQL
      query SearchTweets($query: String!, $first: Int, $after: String) {
        searchTweets(query: $query, first: $first, after: $after) {
          edges {
            node {
              id
              content
              author {
                username
              }
            }
            cursor
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
  let(:author) { create(:user, username: "tweet_author") }

  before do
    create(:tweet, user: author, content: "Learning Ruby on Rails")
    create(:tweet, user: author, content: "GraphQL is awesome")
    create(:tweet, user: author, content: "Hello world from mini-twitter")
  end

  it "finds tweets by content partial match" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "Ruby", first: 20 }.to_json,
      operationName: "SearchTweets"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    nodes = body.dig("data", "searchTweets", "edges").map { |e| e["node"] }
    expect(nodes.length).to eq(1)
    expect(nodes.first["content"]).to eq("Learning Ruby on Rails")
    expect(nodes.first.dig("author", "username")).to eq("tweet_author")
  end

  it "returns empty when no matches" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "nonexistent_xyz", first: 20 }.to_json,
      operationName: "SearchTweets"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "searchTweets", "edges")).to eq([])
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { query: "Ruby", first: 20 }.to_json,
      operationName: "SearchTweets"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "searchTweets")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a validation error for an empty query string" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "   ", first: 20 }.to_json,
      operationName: "SearchTweets"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "searchTweets")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end
end
