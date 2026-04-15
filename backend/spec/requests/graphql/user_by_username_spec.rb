require "rails_helper"

RSpec.describe "GraphQL userByUsername", type: :request do
  let(:query) do
    <<~GRAPHQL
      query UserByUsername($username: String!) {
        userByUsername(username: $username) {
          id
          username
          displayName
          bio
          tweetsCount
          followersCount
          followingCount
          isFollowedByMe
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }
  let(:target_user) { create(:user, username: "target_user", display_name: "Target", bio: "Hello world") }

  it "returns user by username" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { username: target_user.username }.to_json,
      operationName: "UserByUsername"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "userByUsername", "username")).to eq("target_user")
    expect(body.dig("data", "userByUsername", "displayName")).to eq("Target")
    expect(body.dig("data", "userByUsername", "bio")).to eq("Hello world")
    expect(body.dig("data", "userByUsername", "tweetsCount")).to eq(0)
    expect(body.dig("data", "userByUsername", "followersCount")).to eq(0)
    expect(body.dig("data", "userByUsername", "followingCount")).to eq(0)
    expect(body.dig("data", "userByUsername", "isFollowedByMe")).to eq(false)
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { username: target_user.username }.to_json,
      operationName: "UserByUsername"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "userByUsername")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error for a nonexistent username" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { username: "nonexistent_user" }.to_json,
      operationName: "UserByUsername"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "userByUsername")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
