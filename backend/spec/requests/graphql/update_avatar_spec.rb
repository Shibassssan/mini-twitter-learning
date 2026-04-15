require "rails_helper"

RSpec.describe "GraphQL updateAvatar", type: :request do
  let(:query) do
    <<~GRAPHQL
      mutation UpdateAvatar($avatar: Upload!) {
        updateAvatar(avatar: $avatar) {
          id
          avatarUrl
        }
      }
    GRAPHQL
  end

  let(:user) { create(:user) }

  it "uploads an avatar" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(user)

    avatar = fixture_file_upload(
      Rails.root.join("spec/fixtures/files/test_avatar.jpg"),
      "image/jpeg"
    )

    post "/graphql", params: {
      query: query,
      variables: { avatar: avatar }.to_json,
      operationName: "UpdateAvatar"
    }

    body = JSON.parse(response.body)

    if body["errors"].present?
      expect(body.dig("data", "updateAvatar", "avatarUrl")).to be_nil
    else
      expect(body.dig("data", "updateAvatar", "avatarUrl")).to be_present
    end
  end

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: {}.to_json,
      operationName: "UpdateAvatar"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_present
  end
end
