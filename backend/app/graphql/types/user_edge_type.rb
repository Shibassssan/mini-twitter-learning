module Types
  class UserEdgeType < Types::BaseObject
    field :node, Types::UserType, null: false
    field :cursor, String, null: false
  end
end
