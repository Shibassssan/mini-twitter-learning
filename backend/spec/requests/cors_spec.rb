require "rails_helper"

RSpec.describe "CORS", type: :request do
  it "allows configured frontend origins to access the GraphQL endpoint with credentials" do
    options "/graphql", headers: {
      "Origin" => "http://localhost:5173",
      "Access-Control-Request-Method" => "POST"
    }

    expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:5173")
    expect(response.headers["Access-Control-Allow-Credentials"]).to eq("true")
  end
end
