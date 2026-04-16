module Types
  class QueryType < Types::BaseObject
    field :me, resolver: Resolvers::Me
    field :timeline, resolver: Resolvers::Timeline, connection: false, complexity: 12
    field :public_timeline, resolver: Resolvers::PublicTimeline, connection: false, complexity: 12
    field :user_tweets, resolver: Resolvers::UserTweets, connection: false, complexity: 12
    field :liked_tweets, resolver: Resolvers::LikedTweets, connection: false, complexity: 12
    field :followers, resolver: Resolvers::Followers, connection: false, complexity: 12
    field :following, resolver: Resolvers::Following, connection: false, complexity: 12
    field :user_by_username, resolver: Resolvers::UserByUsername
    field :search_users, resolver: Resolvers::SearchUsers, connection: false, complexity: 12
    field :search_tweets, resolver: Resolvers::SearchTweets, connection: false, complexity: 12
  end
end
