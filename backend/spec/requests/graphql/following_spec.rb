require "rails_helper"

RSpec.describe "GraphQL following", type: :request do
  let(:query) do
    <<~GRAPHQL
      query Following($uuid: ID!, $first: Int) {
        following(uuid: $uuid, first: $first) {
          edges {
            node {
              id
              username
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
  let(:target_user) { create(:user) }

  it "returns users that the given user is following" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    followed_users = create_list(:user, 3)
    followed_users.each { |followed| create(:follow, follower: target_user, followed: followed) }

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "Following"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "following", "edges").length).to eq(3)
  end

  it "returns empty when the user is not following anyone" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "Following"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "following", "edges")).to eq([])
    expect(body.dig("data", "following", "pageInfo", "hasNextPage")).to eq(false)
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "Following"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "following")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error for an invalid user uuid" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { uuid: "nonexistent-uuid", first: 20 }.to_json,
      operationName: "Following"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "following")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
