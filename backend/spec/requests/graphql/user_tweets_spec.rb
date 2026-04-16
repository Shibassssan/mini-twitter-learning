require "rails_helper"

RSpec.describe "GraphQL userTweets", type: :request do
  let(:query) do
    <<~GRAPHQL
      query UserTweets($uuid: ID!, $first: Int!) {
        userTweets(uuid: $uuid, first: $first) {
          edges {
            node {
              content
              author {
                username
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    GRAPHQL
  end

  let(:current_user) { create(:user) }
  let(:target_user) { create(:user, username: "target_user") }

  it "returns only tweets for the requested user" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(current_user)
    create(:tweet, user: target_user, content: "target one")
    create(:tweet, user: target_user, content: "target two")
    create(:tweet, user: current_user, content: "other user tweet")

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "UserTweets"
    }

    body = JSON.parse(response.body)
    contents = body.dig("data", "userTweets", "edges").map { |edge| edge.dig("node", "content") }

    expect(body["errors"]).to be_nil
    expect(contents).to match_array([ "target one", "target two" ])
    expect(body.dig("data", "userTweets", "edges").pluck("node").map { |node| node.dig("author", "username") }.uniq).to eq([ "target_user" ])
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "UserTweets"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "userTweets")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error for an invalid user uuid" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(current_user)

    post "/graphql", params: {
      query: query,
      variables: { uuid: "nonexistent-uuid", first: 20 }.to_json,
      operationName: "UserTweets"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "userTweets")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
