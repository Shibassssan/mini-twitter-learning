module Types
  class MutationType < Types::BaseObject
    field :sign_up, mutation: Mutations::SignUp
    field :sign_in, mutation: Mutations::SignIn
    field :sign_out, mutation: Mutations::SignOut
    field :refresh_token, mutation: Mutations::RefreshToken
    field :create_tweet, mutation: Mutations::CreateTweet
    field :delete_tweet, mutation: Mutations::DeleteTweet
    field :like_tweet, mutation: Mutations::LikeTweet
    field :unlike_tweet, mutation: Mutations::UnlikeTweet
    field :follow_user, mutation: Mutations::FollowUser
    field :unfollow_user, mutation: Mutations::UnfollowUser
    field :update_profile, mutation: Mutations::UpdateProfile
    field :update_avatar, mutation: Mutations::UpdateAvatar
  end
end
