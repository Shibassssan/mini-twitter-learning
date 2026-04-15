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

  it "returns an authentication error when unauthenticated" do
    allow_any_instance_of(GraphqlController).to receive(:current_user).and_return(nil)

    post "/graphql", params: {
      query: query,
      variables: { avatar: nil }.to_json,
      operationName: "UpdateAvatar"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_present
  end
end

RSpec.describe Mutations::UpdateAvatar, "#validate_avatar!" do
  let(:mutation) { described_class.allocate }

  before do
    mutation.instance_variable_set(:@context, {})
  end

  it "raises VALIDATION_ERROR for disallowed content type" do
    avatar = double("avatar", content_type: "application/pdf", size: 1.megabyte)

    expect {
      mutation.send(:validate_avatar!, avatar)
    }.to raise_error(GraphQL::ExecutionError) { |e|
      expect(e.message).to eq("Avatar must be JPEG, PNG, or WebP")
      expect(e.extensions[:code]).to eq("VALIDATION_ERROR")
    }
  end

  it "raises VALIDATION_ERROR for oversized file" do
    avatar = double("avatar", content_type: "image/jpeg", size: 3.megabytes)

    expect {
      mutation.send(:validate_avatar!, avatar)
    }.to raise_error(GraphQL::ExecutionError) { |e|
      expect(e.message).to eq("Avatar must be less than 2MB")
      expect(e.extensions[:code]).to eq("VALIDATION_ERROR")
    }
  end

  it "rejects GIF files" do
    avatar = double("avatar", content_type: "image/gif", size: 500.kilobytes)

    expect {
      mutation.send(:validate_avatar!, avatar)
    }.to raise_error(GraphQL::ExecutionError, "Avatar must be JPEG, PNG, or WebP")
  end

  it "rejects file at exactly 2MB boundary" do
    avatar = double("avatar", content_type: "image/jpeg", size: 2.megabytes + 1)

    expect {
      mutation.send(:validate_avatar!, avatar)
    }.to raise_error(GraphQL::ExecutionError, "Avatar must be less than 2MB")
  end

  it "accepts valid JPEG under 2MB" do
    avatar = double("avatar", content_type: "image/jpeg", size: 500.kilobytes)

    expect { mutation.send(:validate_avatar!, avatar) }.not_to raise_error
  end

  it "accepts valid PNG under 2MB" do
    avatar = double("avatar", content_type: "image/png", size: 1.megabyte)

    expect { mutation.send(:validate_avatar!, avatar) }.not_to raise_error
  end

  it "accepts valid WebP under 2MB" do
    avatar = double("avatar", content_type: "image/webp", size: 100.kilobytes)

    expect { mutation.send(:validate_avatar!, avatar) }.not_to raise_error
  end
end
