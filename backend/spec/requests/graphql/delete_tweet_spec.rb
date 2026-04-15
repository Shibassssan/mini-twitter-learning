require "rails_helper"

RSpec.describe "GraphQL deleteTweet", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation DeleteTweet($uuid: ID!) {
        deleteTweet(uuid: $uuid)
      }
    GRAPHQL
  end

  let(:owner) { create(:user) }
  let(:other_user) { create(:user) }
  let!(:tweet) { create(:tweet, user: owner) }

  it "deletes the current user's tweet" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(owner)

    expect do
      post "/graphql", params: {
        query: query,
        variables: { uuid: tweet.uuid }.to_json,
        operationName: "DeleteTweet"
      }
    end.to change(Tweet, :count).by(-1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "deleteTweet")).to eq(true)
  end

  it "returns an authorization error when deleting another user's tweet" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(other_user)

    post "/graphql", params: {
      query: query,
      variables: { uuid: tweet.uuid }.to_json,
      operationName: "DeleteTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["deleteTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHORIZATION_ERROR")
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { uuid: tweet.uuid }.to_json,
      operationName: "DeleteTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["deleteTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a not found error for non-existent tweet" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(owner)

    post "/graphql", params: {
      query: query,
      variables: { uuid: "00000000-0000-0000-0000-000000000000" }.to_json,
      operationName: "DeleteTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["deleteTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("NOT_FOUND")
  end
end
