module Types
  class AuthPayloadType < Types::BaseObject
    field :access_token, String, null: false
    field :user, Types::UserType, null: false
  end
end
