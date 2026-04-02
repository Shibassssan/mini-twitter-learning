module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false, method: :uuid
    field :username, String, null: false
    field :display_name, String, null: false
    field :bio, String, null: true
    field :tweets_count, Integer, null: false
    field :followers_count, Integer, null: false
    field :following_count, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
