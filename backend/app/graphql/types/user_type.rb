module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false, method: :uuid
    field :username, String, null: false
    field :display_name, String, null: false
    field :bio, String, null: true
    field :avatar_url, String, null: true
    field :tweets_count, Integer, null: false
    field :followers_count, Integer, null: false
    field :following_count, Integer, null: false
    field :is_followed_by_me, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    def avatar_url
      return nil unless object.avatar.attached?

      variant = object.avatar.variant(resize_to_fill: [ 200, 200 ])
      Rails.application.routes.url_helpers.rails_blob_path(variant, only_path: true)
    end

    def is_followed_by_me
      current_user = context[:current_user]
      return false unless current_user

      dataloader.with(
        Sources::AssociationExistsLoader,
        Follow, :followed_id, :follower_id, current_user.id
      ).load(object.id)
    end
  end
end
