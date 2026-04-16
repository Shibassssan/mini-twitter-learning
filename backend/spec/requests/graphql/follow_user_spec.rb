require "rails_helper"

RSpec.describe "GraphQL followUser", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation FollowUser($userUuid: ID!) {
        followUser(userUuid: $userUuid) {
          id
          username
          followersCount
          isFollowedByMe
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }
  let(:target_user) { create(:user) }

  it "follows another user" do
    headers = sign_in_as(user)

    expect do
      post "/graphql", params: {
        query: query,
        variables: { userUuid: target_user.uuid }.to_json,
        operationName: "FollowUser"
      }, headers: headers
    end.to change(Follow, :count).by(1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "followUser", "isFollowedByMe")).to eq(true)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: {
      query: query,
      variables: { userUuid: target_user.uuid }.to_json,
      operationName: "FollowUser"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["followUser"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a validation error when following yourself" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { userUuid: user.uuid }.to_json,
      operationName: "FollowUser"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["data"]["followUser"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end

  it "returns a validation error for a duplicate follow" do
    headers = sign_in_as(user)
    create(:follow, follower: user, followed: target_user)

    post "/graphql", params: {
      query: query,
      variables: { userUuid: target_user.uuid }.to_json,
      operationName: "FollowUser"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["data"]["followUser"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end

  it "returns a not found error for an invalid user uuid" do
    headers = sign_in_as(user)

    post "/graphql", params: {
      query: query,
      variables: { userUuid: "nonexistent-uuid" }.to_json,
      operationName: "FollowUser"
    }, headers: headers

    body = JSON.parse(response.body)

    expect(body["data"]["followUser"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
