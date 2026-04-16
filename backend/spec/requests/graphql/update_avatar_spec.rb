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
    post "/graphql", params: {
      query: query,
      variables: { avatar: nil }.to_json,
      operationName: "UpdateAvatar"
    }

    body = JSON.parse(response.body)

    expect(body["errors"]).to be_present
  end
end

RSpec.describe User, "#validate_avatar_upload!" do
  let(:user) { build(:user) }

  def upload_double(filename:, size:, io: StringIO.new(""))
    double(
      "avatar",
      content_type: "application/octet-stream",
      size: size,
      original_filename: filename,
      tempfile: io
    )
  end

  it "raises ArgumentError for disallowed content type" do
    avatar = upload_double(filename: "doc.pdf", size: 1.megabyte, io: StringIO.new("%PDF-1.4\n"))

    expect { user.validate_avatar_upload!(avatar) }.to raise_error(
      ArgumentError,
      "Avatar must be JPEG, PNG, or WebP"
    )
  end

  it "raises ArgumentError for oversized file" do
    avatar = upload_double(filename: "big.jpg", size: 3.megabytes)

    expect { user.validate_avatar_upload!(avatar) }.to raise_error(
      ArgumentError,
      "Avatar must be less than 2MB"
    )
  end

  it "rejects GIF files" do
    avatar = upload_double(
      filename: "anim.gif",
      size: 500.kilobytes,
      io: StringIO.new("GIF89a\x00\x00\x00")
    )

    expect { user.validate_avatar_upload!(avatar) }.to raise_error(
      ArgumentError,
      "Avatar must be JPEG, PNG, or WebP"
    )
  end

  it "rejects file at exactly 2MB boundary" do
    avatar = upload_double(filename: "edge.jpg", size: 2.megabytes + 1)

    expect { user.validate_avatar_upload!(avatar) }.to raise_error(
      ArgumentError,
      "Avatar must be less than 2MB"
    )
  end

  it "accepts valid JPEG under 2MB" do
    avatar = upload_double(filename: "photo.jpg", size: 500.kilobytes)

    expect { user.validate_avatar_upload!(avatar) }.not_to raise_error
  end

  it "accepts valid PNG under 2MB" do
    avatar = upload_double(filename: "pic.png", size: 1.megabyte)

    expect { user.validate_avatar_upload!(avatar) }.not_to raise_error
  end

  it "accepts valid WebP under 2MB" do
    avatar = upload_double(filename: "pic.webp", size: 100.kilobytes)

    expect { user.validate_avatar_upload!(avatar) }.not_to raise_error
  end
end
