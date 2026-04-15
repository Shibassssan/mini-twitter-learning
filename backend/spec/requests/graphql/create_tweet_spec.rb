require "rails_helper"

RSpec.describe "GraphQL createTweet", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation CreateTweet($content: String!) {
        createTweet(content: $content) {
          id
          content
          author {
            username
          }
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user, username: "tweet_author") }

  it "creates a tweet for the current user" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    expect do
      post "/graphql", params: {
        query: query,
        variables: { content: "Hello timeline" }.to_json,
        operationName: "CreateTweet"
      }
    end.to change(Tweet, :count).by(1)

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "createTweet", "content")).to eq("Hello timeline")
    expect(body.dig("data", "createTweet", "author", "username")).to eq("tweet_author")
  end

  it "returns a validation error for blank content" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { content: "   " }.to_json,
      operationName: "CreateTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["createTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end

  it "strips whitespace from content" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { content: "  Hello with spaces  " }.to_json,
      operationName: "CreateTweet"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "createTweet", "content")).to eq("Hello with spaces")
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { content: "Hello timeline" }.to_json,
      operationName: "CreateTweet"
    }

    body = JSON.parse(response.body)

    expect(body["data"]["createTweet"]).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
