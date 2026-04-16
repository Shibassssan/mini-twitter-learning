require "rails_helper"

RSpec.describe "GraphQL followers", type: :request do
  let(:query) do
    <<~GRAPHQL
      query Followers($uuid: ID!, $first: Int) {
        followers(uuid: $uuid, first: $first) {
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

  it "returns followers of a given user" do
    headers = sign_in_as(user)

    followers = create_list(:user, 3)
    followers.each { |follower| create(:follow, follower: follower, followed: target_user) }

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "Followers"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "followers", "edges").length).to eq(3)
  end

  it "returns empty when the user has no followers" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "Followers"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "followers", "edges")).to eq([])
    expect(body.dig("data", "followers", "pageInfo", "hasNextPage")).to eq(false)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: {
      query: query,
      variables: { uuid: target_user.uuid, first: 20 }.to_json,
      operationName: "Followers"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "followers")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error for an invalid user uuid" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { uuid: "nonexistent-uuid", first: 20 }.to_json,
      operationName: "Followers"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body.dig("data", "followers")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
