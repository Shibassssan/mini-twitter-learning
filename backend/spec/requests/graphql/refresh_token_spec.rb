require "rails_helper"

RSpec.describe "GraphQL refreshToken", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation RefreshToken {
        refreshToken {
          accessToken
          user {
            id
            username
            displayName
          }
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }

  it "returns a new access token for a valid refresh cookie" do
    allow_any_instance_of(GraphqlController).to receive(:authorize_by_refresh_cookie!).and_return(true)
    allow_any_instance_of(GraphqlController).to receive(:payload).and_return({ "user_id" => user.id })
    allow_any_instance_of(GraphqlController).to receive(:found_token).and_return("refresh-token")
    allow(AuthService).to receive(:refresh_access_token!).with("refresh-token", payload: { "user_id" => user.id }).and_return(
      access: "new-access-token"
    )

    cookies[JWTSessions.refresh_cookie] = "refresh-token"

    post "/graphql", params: { query: query, operationName: "RefreshToken" }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "refreshToken", "accessToken")).to eq("new-access-token")
    expect(body.dig("data", "refreshToken", "user", "username")).to eq(user.username)
    expect(AuthService).to have_received(:refresh_access_token!).with("refresh-token", payload: { "user_id" => user.id })
  end

  it "returns an authentication error when the refresh token is invalid" do
    allow_any_instance_of(GraphqlController).to receive(:authorize_by_refresh_cookie!).and_raise(JWTSessions::Errors::Unauthorized, "invalid")

    post "/graphql", params: { query: query, operationName: "RefreshToken" }

    body = JSON.parse(response.body)

    expect(body["data"]["refreshToken"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
