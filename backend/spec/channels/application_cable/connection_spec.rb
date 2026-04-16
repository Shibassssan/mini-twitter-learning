# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationCable::Connection, type: :channel do
  let(:user) { create(:user) }

  it "rejects a connection without a token" do
    expect do
      connect "/cable"
    end.to have_rejected_connection
  end

  it "rejects a connection with an invalid token" do
    expect do
      connect "/cable?token=not-a-jwt"
    end.to have_rejected_connection
  end

  it "successfully connects with a valid access token" do
    tokens = AuthService.issue_tokens_for(user)
    connect "/cable?token=#{tokens[:access]}"
    expect(connection.current_user).to eq(user)
  end
end
