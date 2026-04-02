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

  let(:user) { create(:user) }

  it "returns an empty connection until follow relationships are implemented" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)
    create(:tweet, user: user)

    post "/graphql", params: { query: query, operationName: "Timeline" }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_nil
    expect(body.dig("data", "timeline", "edges")).to eq([])
    expect(body.dig("data", "timeline", "pageInfo", "hasNextPage")).to eq(false)
  end
end
