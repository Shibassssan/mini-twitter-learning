module Types
  class TweetConnectionType < Types::BaseObject
    field :edges, [ Types::TweetEdgeType ], null: false
    field :page_info, Types::PageInfoType, null: false
  end
end
