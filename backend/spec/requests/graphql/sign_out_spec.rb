require "rails_helper"

RSpec.describe "GraphQL signOut", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation SignOut {
        signOut
      }
    GRAPHQL
  end

  let(:user) { create(:user) }

  it "returns true and clears the refresh cookie for an authenticated user" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)
    allow(AuthService).to receive(:flush_refresh_token!).with("refresh-token").and_return(1)

    cookies[JWTSessions.refresh_cookie] = "refresh-token"

    post "/graphql", params: { query: query }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "signOut")).to eq(true)
    expect(AuthService).to have_received(:flush_refresh_token!).with("refresh-token")
    expect(response.cookies[JWTSessions.refresh_cookie]).to be_nil
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: { query: query }

    body = JSON.parse(response.body)

    expect(body["data"]["signOut"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
