require "rails_helper"

RSpec.describe "GraphQL signIn", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation SignIn($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
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

  let(:credential) { create(:credential, email: "signed_in@example.com", password: "password123", password_confirmation: "password123") }
  let(:variables) do
    {
      email: credential.email,
      password: "password123"
    }
  end

  before do
    allow(AuthService).to receive(:issue_tokens_for).and_return(
      access: "access-token",
      refresh: "refresh-token"
    )
  end

  it "returns auth payload and sets the refresh cookie for valid credentials" do
    post "/graphql", params: {
      query: query,
      variables: variables.to_json,
      operationName: "SignIn"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "signIn", "accessToken")).to eq("access-token")
    expect(body.dig("data", "signIn", "user", "username")).to eq(credential.user.username)
    expect(response.cookies["refresh_token"]).to eq("refresh-token")
  end

  it "returns an authentication error for invalid credentials" do
    post "/graphql", params: {
      query: query,
      variables: { email: credential.email, password: "wrong-password" }.to_json,
      operationName: "SignIn"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["signIn"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns an authentication error for non-existent email" do
    post "/graphql", params: {
      query: query,
      variables: { email: "nobody@example.com", password: "password123" }.to_json,
      operationName: "SignIn"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["signIn"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns an internal server error when token issuance fails" do
    allow(AuthService).to receive(:issue_tokens_for).and_raise(StandardError, "Redis down")

    post "/graphql", params: {
      query: query,
      variables: variables.to_json,
      operationName: "SignIn"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["signIn"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("INTERNAL_SERVER_ERROR")
    expect(body["errors"].first["message"]).to eq("Internal server error")
  end
end
