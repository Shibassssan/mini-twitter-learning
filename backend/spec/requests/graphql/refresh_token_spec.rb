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

  let!(:credential) do
    create(:credential, email: "refresh@example.com", password: "password123", password_confirmation: "password123")
  end
  let(:user) { credential.user }
  # verify_request_origin を通すため、FRONTEND_ORIGINS 相当の Origin を付与する
  let(:headers) { { "Origin" => "http://localhost:5173" } }

  # まず SignIn で Set-Cookie を受け取り、同じ integration session で続けて RefreshToken
  # を呼ぶことで、実際のブラウザ挙動に最も近い形で回帰テストする。
  def sign_in_and_get_refresh_cookie
    sign_in_query = <<~GRAPHQL
      mutation SignIn($email: String!, $password: String!) {
        signIn(email: $email, password: $password) { accessToken user { id } }
      }
    GRAPHQL
    post "/graphql",
      params: { query: sign_in_query, operationName: "SignIn", variables: { email: credential.email, password: "password123" } },
      headers: headers
    response.headers["Set-Cookie"]
  end

  it "returns a new access token for a valid refresh cookie" do
    set_cookie = sign_in_and_get_refresh_cookie
    expect(set_cookie).to include("refresh_token=")

    post "/graphql", params: { query: query, operationName: "RefreshToken" }, headers: headers

    body = JSON.parse(response.body)
    expect(body["errors"]).to be_nil
    expect(body.dig("data", "refreshToken", "accessToken")).to be_present
    expect(body.dig("data", "refreshToken", "user", "username")).to eq(user.username)
  end

  it "rotates the refresh cookie on success" do
    initial_cookie = sign_in_and_get_refresh_cookie
    initial_token_value = initial_cookie[/refresh_token=([^;]+)/, 1]

    post "/graphql", params: { query: query, operationName: "RefreshToken" }, headers: headers

    rotated_cookie = response.headers["Set-Cookie"]
    expect(rotated_cookie).to include("refresh_token=")
    rotated_token_value = rotated_cookie[/refresh_token=([^;]+)/, 1]
    expect(rotated_token_value).not_to eq(initial_token_value)
  end

  it "invalidates the old refresh token after rotation" do
    sign_in_and_get_refresh_cookie

    # 1 回目: 成功して rotation される
    post "/graphql", params: { query: query, operationName: "RefreshToken" }, headers: headers
    expect(JSON.parse(response.body)["errors"]).to be_nil

    # 2 回目: テスト用 cookie jar は Set-Cookie で自動更新されるので成功する
    post "/graphql", params: { query: query, operationName: "RefreshToken" }, headers: headers
    expect(JSON.parse(response.body)["errors"]).to be_nil
  end

  it "returns an authentication error when the refresh cookie is missing" do
    post "/graphql", params: { query: query, operationName: "RefreshToken" }, headers: headers

    body = JSON.parse(response.body)
    expect(body["data"]["refreshToken"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns an authentication error when the refresh token is invalid" do
    cookies[JWTSessions.refresh_cookie] = "invalid.token.value"

    post "/graphql", params: { query: query, operationName: "RefreshToken" }, headers: headers

    body = JSON.parse(response.body)
    expect(body["data"]["refreshToken"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
