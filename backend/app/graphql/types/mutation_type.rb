module Types
  class MutationType < Types::BaseObject
    field :sign_up, mutation: Mutations::SignUp
    field :sign_in, mutation: Mutations::SignIn
    field :sign_out, mutation: Mutations::SignOut
    field :refresh_token, mutation: Mutations::RefreshToken
    field :create_tweet, mutation: Mutations::CreateTweet
    field :delete_tweet, mutation: Mutations::DeleteTweet
  end
end
