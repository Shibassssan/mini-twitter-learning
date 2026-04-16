require "rails_helper"

RSpec.describe "GraphQL me", type: :request do
  let(:query) do
    <<~GRAPHQL
      query {
        me {
          id
          username
          displayName
        }
      }
    GRAPHQL
  end

  it "returns the current user when authenticated" do
    user = create(:user, username: "auth_user")
    headers = sign_in_as(user)

    post "/graphql", params: { query: query }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "me", "username")).to eq("auth_user")
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: { query: query }

    body = JSON.parse(response.body)

    expect(body["data"]["me"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
