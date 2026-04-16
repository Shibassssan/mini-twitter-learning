# frozen_string_literal: true

require "rails_helper"

RSpec.describe GraphqlChannel, type: :channel do
  let(:user) { create(:user) }
  let(:tokens) { AuthService.issue_tokens_for(user) }

  before do
    stub_connection(current_user: user)
  end

  it "rejects execute payloads that are not subscription operations" do
    subscribe

    expect do
      perform :execute, {
        "query" => "query { me { id } }",
        "variables" => {},
        "operationName" => nil
      }
    end.not_to have_broadcasted_to("graphql-event-stream")

    expect(transmissions.last.dig(:result, :errors, 0, :message)).to include("Only subscriptions are allowed")
  end
end
