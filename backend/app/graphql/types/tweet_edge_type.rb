module Types
  class TweetEdgeType < Types::BaseObject
    field :node, Types::TweetType, null: false
    field :cursor, String, null: false
  end
end
