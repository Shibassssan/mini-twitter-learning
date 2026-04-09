module Types
  class UserConnectionType < Types::BaseObject
    field :edges, [Types::UserEdgeType], null: false
    field :page_info, Types::PageInfoType, null: false
  end
end
