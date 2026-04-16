module Types
  class QueryType < Types::BaseObject
    field :me, resolver: Resolvers::Me
    field :timeline, resolver: Resolvers::Timeline, connection: false
    field :public_timeline, resolver: Resolvers::PublicTimeline, connection: false
    field :user_tweets, resolver: Resolvers::UserTweets, connection: false
    field :liked_tweets, resolver: Resolvers::LikedTweets, connection: false
    field :followers, resolver: Resolvers::Followers, connection: false
    field :following, resolver: Resolvers::Following, connection: false
    field :user_by_username, resolver: Resolvers::UserByUsername
    field :search_users, resolver: Resolvers::SearchUsers, connection: false
    field :search_tweets, resolver: Resolvers::SearchTweets, connection: false
  end
end
