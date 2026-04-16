# frozen_string_literal: true

module AuthHelper
  def sign_in_as(user)
    tokens = AuthService.issue_tokens_for(user)
    { "Authorization" => "Bearer #{tokens[:access]}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :request
end
