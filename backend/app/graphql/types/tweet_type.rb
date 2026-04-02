module Types
  class TweetType < Types::BaseObject
    field :id, ID, null: false, method: :uuid
    field :content, String, null: false
    field :author, Types::UserType, null: false
    field :likes_count, Integer, null: false
    field :is_liked_by_me, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    def author
      dataloader.with(Sources::RecordLoader, User).load(object.user_id)
    end

    def is_liked_by_me
      false
    end
  end
end
