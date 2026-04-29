# frozen_string_literal: true

require "rails_helper"

RSpec.describe AuthService do
  let(:user) { create(:user) }

  describe ".register" do
    it "creates a user with credential and returns tokens" do
      result = described_class.register(
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        display_name: "New User"
      )

      expect(result[:user]).to be_persisted
      expect(result[:user].username).to eq("newuser")
      expect(result[:user].credential.email).to eq("new@example.com")
      expect(result[:tokens][:access]).to be_present
      expect(result[:tokens][:refresh]).to be_present
    end

    it "raises RegistrationError for duplicate email" do
      create(:credential, email: "taken@example.com")

      expect do
        described_class.register(
          username: "another",
          email: "taken@example.com",
          password: "password123",
          display_name: "Another"
        )
      end.to raise_error(
        AuthService::RegistrationError,
        "Unable to create account. Please verify your information."
      )
    end

    it "raises RegistrationError for duplicate username" do
      create(:user, username: "taken_name")

      expect do
        described_class.register(
          username: "taken_name",
          email: "unique@example.com",
          password: "password123",
          display_name: "Another"
        )
      end.to raise_error(
        AuthService::RegistrationError,
        "Unable to create account. Please verify your information."
      )
    end

    it "raises RegistrationError with validation details for other errors" do
      expect do
        described_class.register(
          username: "ab",
          email: "valid@example.com",
          password: "password123",
          display_name: "Name"
        )
      end.to raise_error(AuthService::RegistrationError)
    end
  end

  describe ".authenticate" do
    let!(:credential) { create(:credential, email: "auth@example.com", password: "secret99", password_confirmation: "secret99") }

    it "returns user and tokens for valid credentials" do
      result = described_class.authenticate(email: "auth@example.com", password: "secret99")

      expect(result[:user]).to eq(credential.user)
      expect(result[:tokens][:access]).to be_present
      expect(result[:tokens][:refresh]).to be_present
    end

    it "raises AuthenticationError for wrong password" do
      expect do
        described_class.authenticate(email: "auth@example.com", password: "wrong")
      end.to raise_error(AuthService::AuthenticationError, "Invalid email or password")
    end

    it "raises AuthenticationError for unknown email" do
      expect do
        described_class.authenticate(email: "nobody@example.com", password: "secret99")
      end.to raise_error(AuthService::AuthenticationError, "Invalid email or password")
    end
  end

  describe ".issue_tokens_for" do
    it "returns access and refresh token strings" do
      result = described_class.issue_tokens_for(user)
      expect(result[:access]).to be_present
      expect(result[:refresh]).to be_present
    end

    it "embeds user_id into both access and refresh token payloads" do
      result = described_class.issue_tokens_for(user)
      access_payload = JWTSessions::Token.decode(result[:access], {}).first
      refresh_payload = JWTSessions::Token.decode(result[:refresh], {}).first
      expect(access_payload["user_id"]).to eq(user.id)
      expect(refresh_payload["user_id"]).to eq(user.id)
    end
  end

  describe ".refresh_access_token!" do
    it "returns a new access token when refresh is valid" do
      tokens = described_class.issue_tokens_for(user)
      payload = JWTSessions::Token.decode(tokens[:refresh], {}).first
      new_tokens = described_class.refresh_access_token!(
        tokens[:refresh],
        payload: payload
      )
      expect(new_tokens[:access]).to be_present
    end

    it "keeps user_id on the rotated refresh token" do
      tokens = described_class.issue_tokens_for(user)
      payload = JWTSessions::Token.decode(tokens[:refresh], {}).first
      new_tokens = described_class.refresh_access_token!(
        tokens[:refresh],
        payload: payload
      )
      rotated_payload = JWTSessions::Token.decode(new_tokens[:refresh], {}).first
      expect(rotated_payload["user_id"]).to eq(user.id)
    end
  end

  describe ".flush_refresh_token!" do
    it "invalidates the refresh token session" do
      tokens = described_class.issue_tokens_for(user)
      described_class.flush_refresh_token!(tokens[:refresh])
      payload = JWTSessions::Token.decode(tokens[:refresh], {}).first
      expect do
        described_class.refresh_access_token!(tokens[:refresh], payload: payload)
      end.to raise_error(JWTSessions::Errors::Unauthorized)
    end
  end

  describe ".refresh_cookie_options" do
    it "sets httponly and same_site" do
      opts = described_class.refresh_cookie_options("rtoken")
      expect(opts[:httponly]).to eq(true)
      expect(opts[:value]).to eq("rtoken")
      expect(opts[:same_site]).to be_present
    end
  end
end
