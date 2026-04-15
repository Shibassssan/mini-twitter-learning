require "rails_helper"

RSpec.describe "GraphQL updateProfile", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation UpdateProfile($displayName: String, $bio: String) {
        updateProfile(displayName: $displayName, bio: $bio) {
          id
          displayName
          bio
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user, display_name: "Original Name", bio: "Original bio") }

  it "updates display_name only" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { displayName: "New Name" }.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "updateProfile", "displayName")).to eq("New Name")
    expect(body.dig("data", "updateProfile", "bio")).to eq("Original bio")
  end

  it "updates bio only" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { bio: "New bio" }.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "updateProfile", "displayName")).to eq("Original Name")
    expect(body.dig("data", "updateProfile", "bio")).to eq("New bio")
  end

  it "updates both display_name and bio" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { displayName: "New Name", bio: "New bio" }.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "updateProfile", "displayName")).to eq("New Name")
    expect(body.dig("data", "updateProfile", "bio")).to eq("New bio")
  end

  it "clears bio by setting null" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { bio: nil }.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "updateProfile", "bio")).to be_nil
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { displayName: "New Name" }.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["updateProfile"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a validation error when display_name is too long" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { displayName: "a" * 51 }.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["updateProfile"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end

  it "returns a validation error when no attributes are provided" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: {}.to_json,
      operationName: "UpdateProfile"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["updateProfile"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end
end
