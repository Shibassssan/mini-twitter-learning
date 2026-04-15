require "rails_helper"

RSpec.describe "GraphQL searchUsers", type: :request do
  let(:query) do
    <<~GRAPHQL
      query SearchUsers($query: String!, $first: Int, $after: String) {
        searchUsers(query: $query, first: $first, after: $after) {
          edges {
            node {
              id
              username
              displayName
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }

  before do
    create(:user, username: "alice_dev", display_name: "Alice Developer")
    create(:user, username: "bob_eng", display_name: "Bob Engineer")
    create(:user, username: "charlie_pm", display_name: "Charlie Manager")
  end

  it "finds users by username partial match" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "alice", first: 20 }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    nodes = body.dig("data", "searchUsers", "edges").map { |e| e["node"] }
    expect(nodes.length).to eq(1)
    expect(nodes.first["username"]).to eq("alice_dev")
  end

  it "finds users by display_name partial match" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "Engineer", first: 20 }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    nodes = body.dig("data", "searchUsers", "edges").map { |e| e["node"] }
    expect(nodes.length).to eq(1)
    expect(nodes.first["username"]).to eq("bob_eng")
  end

  it "returns empty when no matches" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "nonexistent_xyz", first: 20 }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "searchUsers", "edges")).to eq([])
  end

  it "paginates results" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "_", first: 2 }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "searchUsers", "edges").length).to eq(2)
    expect(body.dig("data", "searchUsers", "pageInfo", "hasNextPage")).to eq(true)

    end_cursor = body.dig("data", "searchUsers", "pageInfo", "endCursor")

    post "/graphql", params: {
      query: query,
      variables: { query: "_", first: 2, after: end_cursor }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "searchUsers", "edges").length).to be >= 1
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { query: "alice", first: 20 }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "searchUsers")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end

  it "returns a validation error for an empty query string" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    post "/graphql", params: {
      query: query,
      variables: { query: "   ", first: 20 }.to_json,
      operationName: "SearchUsers"
    }

    body = JSON.parse(response.body)

    expect(body.dig("data", "searchUsers")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("VALIDATION_ERROR")
  end
end
