require "rails_helper"

RSpec.describe "GraphQL rate limits", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation SignIn($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
          accessToken
        }
      }
    GRAPHQL
  end

  let(:variables) do
    {
      email: "nobody@example.com",
      password: "wrong-password"
    }
  end

  it "throttles repeated auth attempts" do
    5.times do
      post "/graphql", params: {
        query: query,
        variables: variables.to_json,
        operationName: "SignIn"
      }
    end

    post "/graphql", params: {
      query: query,
      variables: variables.to_json,
      operationName: "SignIn"
    }

    body = JSON.parse(response.body)

    expect(response).to have_http_status(:too_many_requests)
    expect(body["errors"].first["extensions"]["code"]).to eq("RATE_LIMITED")
  end
end
