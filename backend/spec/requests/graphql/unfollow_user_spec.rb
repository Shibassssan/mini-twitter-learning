require "rails_helper"

RSpec.describe "GraphQL unfollowUser", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation UnfollowUser($userUuid: ID!) {
        unfollowUser(userUuid: $userUuid) {
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

  it "unfollows a previously followed user" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)
    create(:follow, follower: user, followed: target_user)

    expect do
      post "/graphql", params: {
        query: query,
        variables: { userUuid: target_user.uuid }.to_json,
        operationName: "UnfollowUser"
      }
    end.to change(Follow, :count).by(-1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "unfollowUser", "isFollowedByMe")).to eq(false)
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { userUuid: target_user.uuid }.to_json,
      operationName: "UnfollowUser"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["unfollowUser"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error when unfollowing a user not followed" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { userUuid: target_user.uuid }.to_json,
      operationName: "UnfollowUser"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["unfollowUser"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
