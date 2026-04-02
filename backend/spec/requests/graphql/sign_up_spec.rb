require "rails_helper"

RSpec.describe "GraphQL signUp", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation SignUp($username: String!, $email: String!, $password: String!, $displayName: String!) {
        signUp(username: $username, email: $email, password: $password, displayName: $displayName) {
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

  let(:variables) do
    {
      username: "new_user",
      email: "new_user@example.com",
      password: "password123",
      displayName: "New User"
    }
  end

  before do
    allow(AuthService).to receive(:issue_tokens_for).and_return(
      access: "access-token",
      refresh: "refresh-token"
    )
  end

  it "creates a user, returns auth payload, and sets the refresh cookie" do
    expect do
      post "/graphql", params: {
        query: query,
        variables: variables.to_json,
        operationName: "SignUp"
      }
    end.to change(User, :count).by(1)
      .and change(Credential, :count).by(1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "signUp", "accessToken")).to eq("access-token")
    expect(body.dig("data", "signUp", "user", "username")).to eq("new_user")
    expect(response.cookies["refresh_token"]).to eq("refresh-token")
  end

  it "returns a validation error when the payload is invalid" do
    create(:user, username: "new_user")

    post "/graphql", params: {
      query: query,
      variables: variables.to_json,
      operationName: "SignUp"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["signUp"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end

  it "rolls back the database changes when token issuance fails" do
    allow(AuthService).to receive(:issue_tokens_for).and_raise("token issuance failed")

    expect do
      post "/graphql", params: {
        query: query,
        variables: variables.to_json,
        operationName: "SignUp"
      }
    end.not_to change(User, :count)

    expect(Credential.find_by(email: variables[:email])).to be_nil

    body = JSON.parse(response.body)

    expect(body["data"]["signUp"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("INTERNAL_SERVER_ERROR")
  end
end
