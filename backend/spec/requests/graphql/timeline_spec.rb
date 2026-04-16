require "rails_helper"

RSpec.describe "GraphQL timeline", type: :request do
  let(:query) do
    <<~GRAPHQL
      query Timeline {
        timeline(first: 20) {
          edges {
            node {
              id
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    GRAPHQL
  end

  let(:viewer) { create(:user) }
  let(:author) { create(:user) }

  it "returns tweets from followed users only" do
    headers = sign_in_as(viewer)
    create(:follow, follower: viewer, followed: author)
    tweet = create(:tweet, user: author)
    create(:tweet, user: viewer)

    post "/graphql", params: { query: query, operationName: "Timeline" }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    ids = body.dig("data", "timeline", "edges").map { |e| e.dig("node", "id") }
    expect(ids).to eq([tweet.uuid])
  end

  it "returns an empty connection when not following anyone" do
    headers = sign_in_as(viewer)
    create(:tweet, user: author)

    post "/graphql", params: { query: query, operationName: "Timeline" }, headers: headers

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "timeline", "edges")).to eq([])
    expect(body.dig("data", "timeline", "pageInfo", "hasNextPage")).to eq(false)
  end

  it "returns an authentication error when unauthenticated" do
    post "/graphql", params: { query: query, operationName: "Timeline" }

    body = JSON.parse(response.body)

    expect(body.dig("data", "timeline")).to be_nil
    expect(body["errors"].first["extensions"]["code"]).to eq("AUTHENTICATION_ERROR")
  end
end
