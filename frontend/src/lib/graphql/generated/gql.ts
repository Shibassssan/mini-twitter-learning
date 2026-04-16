/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation CreateTweet($content: String!) {\n  createTweet(content: $content) {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n    }\n  }\n}": typeof types.CreateTweetDocument,
    "mutation DeleteTweet($uuid: ID!) {\n  deleteTweet(uuid: $uuid)\n}": typeof types.DeleteTweetDocument,
    "mutation FollowUser($userUuid: ID!) {\n  followUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}": typeof types.FollowUserDocument,
    "query Followers($uuid: ID!, $first: Int, $after: String) {\n  followers(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.FollowersDocument,
    "query Following($uuid: ID!, $first: Int, $after: String) {\n  following(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.FollowingDocument,
    "mutation LikeTweet($tweetUuid: ID!) {\n  likeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}": typeof types.LikeTweetDocument,
    "query LikedTweets($first: Int, $after: String) {\n  likedTweets(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.LikedTweetsDocument,
    "query Me {\n  me {\n    id\n    username\n    displayName\n    bio\n    tweetsCount\n    followersCount\n    followingCount\n  }\n}": typeof types.MeDocument,
    "query PublicTimeline($first: Int, $after: String) {\n  publicTimeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.PublicTimelineDocument,
    "mutation RefreshToken {\n  refreshToken {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}": typeof types.RefreshTokenDocument,
    "query SearchTweets($query: String!, $first: Int, $after: String) {\n  searchTweets(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.SearchTweetsDocument,
    "query SearchUsers($query: String!, $first: Int, $after: String) {\n  searchUsers(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n        followersCount\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.SearchUsersDocument,
    "mutation SignIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}": typeof types.SignInDocument,
    "mutation SignOut {\n  signOut\n}": typeof types.SignOutDocument,
    "mutation SignUp($username: String!, $displayName: String!, $email: String!, $password: String!) {\n  signUp(\n    username: $username\n    displayName: $displayName\n    email: $email\n    password: $password\n  ) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}": typeof types.SignUpDocument,
    "query Timeline($first: Int, $after: String) {\n  timeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.TimelineDocument,
    "subscription TweetAdded {\n  tweetAdded {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n      isFollowedByMe\n    }\n  }\n}": typeof types.TweetAddedDocument,
    "subscription TweetLikeUpdated($tweetId: ID!) {\n  tweetLikeUpdated(tweetId: $tweetId) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}": typeof types.TweetLikeUpdatedDocument,
    "mutation UnfollowUser($userUuid: ID!) {\n  unfollowUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}": typeof types.UnfollowUserDocument,
    "mutation UnlikeTweet($tweetUuid: ID!) {\n  unlikeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}": typeof types.UnlikeTweetDocument,
    "mutation UpdateAvatar($avatar: Upload!) {\n  updateAvatar(avatar: $avatar) {\n    id\n    avatarUrl\n  }\n}": typeof types.UpdateAvatarDocument,
    "mutation UpdateProfile($displayName: String, $bio: String) {\n  updateProfile(displayName: $displayName, bio: $bio) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n  }\n}": typeof types.UpdateProfileDocument,
    "query UserByUsername($username: String!) {\n  userByUsername(username: $username) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n    tweetsCount\n    followersCount\n    followingCount\n    isFollowedByMe\n    createdAt\n  }\n}": typeof types.UserByUsernameDocument,
    "query UserTweets($uuid: ID!, $first: Int, $after: String) {\n  userTweets(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.UserTweetsDocument,
};
const documents: Documents = {
    "mutation CreateTweet($content: String!) {\n  createTweet(content: $content) {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n    }\n  }\n}": types.CreateTweetDocument,
    "mutation DeleteTweet($uuid: ID!) {\n  deleteTweet(uuid: $uuid)\n}": types.DeleteTweetDocument,
    "mutation FollowUser($userUuid: ID!) {\n  followUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}": types.FollowUserDocument,
    "query Followers($uuid: ID!, $first: Int, $after: String) {\n  followers(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.FollowersDocument,
    "query Following($uuid: ID!, $first: Int, $after: String) {\n  following(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.FollowingDocument,
    "mutation LikeTweet($tweetUuid: ID!) {\n  likeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}": types.LikeTweetDocument,
    "query LikedTweets($first: Int, $after: String) {\n  likedTweets(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.LikedTweetsDocument,
    "query Me {\n  me {\n    id\n    username\n    displayName\n    bio\n    tweetsCount\n    followersCount\n    followingCount\n  }\n}": types.MeDocument,
    "query PublicTimeline($first: Int, $after: String) {\n  publicTimeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.PublicTimelineDocument,
    "mutation RefreshToken {\n  refreshToken {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}": types.RefreshTokenDocument,
    "query SearchTweets($query: String!, $first: Int, $after: String) {\n  searchTweets(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.SearchTweetsDocument,
    "query SearchUsers($query: String!, $first: Int, $after: String) {\n  searchUsers(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n        followersCount\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.SearchUsersDocument,
    "mutation SignIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}": types.SignInDocument,
    "mutation SignOut {\n  signOut\n}": types.SignOutDocument,
    "mutation SignUp($username: String!, $displayName: String!, $email: String!, $password: String!) {\n  signUp(\n    username: $username\n    displayName: $displayName\n    email: $email\n    password: $password\n  ) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}": types.SignUpDocument,
    "query Timeline($first: Int, $after: String) {\n  timeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.TimelineDocument,
    "subscription TweetAdded {\n  tweetAdded {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n      isFollowedByMe\n    }\n  }\n}": types.TweetAddedDocument,
    "subscription TweetLikeUpdated($tweetId: ID!) {\n  tweetLikeUpdated(tweetId: $tweetId) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}": types.TweetLikeUpdatedDocument,
    "mutation UnfollowUser($userUuid: ID!) {\n  unfollowUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}": types.UnfollowUserDocument,
    "mutation UnlikeTweet($tweetUuid: ID!) {\n  unlikeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}": types.UnlikeTweetDocument,
    "mutation UpdateAvatar($avatar: Upload!) {\n  updateAvatar(avatar: $avatar) {\n    id\n    avatarUrl\n  }\n}": types.UpdateAvatarDocument,
    "mutation UpdateProfile($displayName: String, $bio: String) {\n  updateProfile(displayName: $displayName, bio: $bio) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n  }\n}": types.UpdateProfileDocument,
    "query UserByUsername($username: String!) {\n  userByUsername(username: $username) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n    tweetsCount\n    followersCount\n    followingCount\n    isFollowedByMe\n    createdAt\n  }\n}": types.UserByUsernameDocument,
    "query UserTweets($uuid: ID!, $first: Int, $after: String) {\n  userTweets(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.UserTweetsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateTweet($content: String!) {\n  createTweet(content: $content) {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n    }\n  }\n}"): (typeof documents)["mutation CreateTweet($content: String!) {\n  createTweet(content: $content) {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteTweet($uuid: ID!) {\n  deleteTweet(uuid: $uuid)\n}"): (typeof documents)["mutation DeleteTweet($uuid: ID!) {\n  deleteTweet(uuid: $uuid)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation FollowUser($userUuid: ID!) {\n  followUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}"): (typeof documents)["mutation FollowUser($userUuid: ID!) {\n  followUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Followers($uuid: ID!, $first: Int, $after: String) {\n  followers(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query Followers($uuid: ID!, $first: Int, $after: String) {\n  followers(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Following($uuid: ID!, $first: Int, $after: String) {\n  following(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query Following($uuid: ID!, $first: Int, $after: String) {\n  following(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation LikeTweet($tweetUuid: ID!) {\n  likeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}"): (typeof documents)["mutation LikeTweet($tweetUuid: ID!) {\n  likeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query LikedTweets($first: Int, $after: String) {\n  likedTweets(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query LikedTweets($first: Int, $after: String) {\n  likedTweets(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    id\n    username\n    displayName\n    bio\n    tweetsCount\n    followersCount\n    followingCount\n  }\n}"): (typeof documents)["query Me {\n  me {\n    id\n    username\n    displayName\n    bio\n    tweetsCount\n    followersCount\n    followingCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PublicTimeline($first: Int, $after: String) {\n  publicTimeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query PublicTimeline($first: Int, $after: String) {\n  publicTimeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RefreshToken {\n  refreshToken {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}"): (typeof documents)["mutation RefreshToken {\n  refreshToken {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SearchTweets($query: String!, $first: Int, $after: String) {\n  searchTweets(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query SearchTweets($query: String!, $first: Int, $after: String) {\n  searchTweets(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SearchUsers($query: String!, $first: Int, $after: String) {\n  searchUsers(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n        followersCount\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query SearchUsers($query: String!, $first: Int, $after: String) {\n  searchUsers(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        username\n        displayName\n        bio\n        avatarUrl\n        isFollowedByMe\n        followersCount\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SignIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}"): (typeof documents)["mutation SignIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SignOut {\n  signOut\n}"): (typeof documents)["mutation SignOut {\n  signOut\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SignUp($username: String!, $displayName: String!, $email: String!, $password: String!) {\n  signUp(\n    username: $username\n    displayName: $displayName\n    email: $email\n    password: $password\n  ) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}"): (typeof documents)["mutation SignUp($username: String!, $displayName: String!, $email: String!, $password: String!) {\n  signUp(\n    username: $username\n    displayName: $displayName\n    email: $email\n    password: $password\n  ) {\n    accessToken\n    user {\n      id\n      username\n      displayName\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Timeline($first: Int, $after: String) {\n  timeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query Timeline($first: Int, $after: String) {\n  timeline(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "subscription TweetAdded {\n  tweetAdded {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n      isFollowedByMe\n    }\n  }\n}"): (typeof documents)["subscription TweetAdded {\n  tweetAdded {\n    id\n    content\n    createdAt\n    likesCount\n    isLikedByMe\n    author {\n      id\n      username\n      displayName\n      isFollowedByMe\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "subscription TweetLikeUpdated($tweetId: ID!) {\n  tweetLikeUpdated(tweetId: $tweetId) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}"): (typeof documents)["subscription TweetLikeUpdated($tweetId: ID!) {\n  tweetLikeUpdated(tweetId: $tweetId) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UnfollowUser($userUuid: ID!) {\n  unfollowUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}"): (typeof documents)["mutation UnfollowUser($userUuid: ID!) {\n  unfollowUser(userUuid: $userUuid) {\n    id\n    username\n    displayName\n    isFollowedByMe\n    followersCount\n    followingCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UnlikeTweet($tweetUuid: ID!) {\n  unlikeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}"): (typeof documents)["mutation UnlikeTweet($tweetUuid: ID!) {\n  unlikeTweet(tweetUuid: $tweetUuid) {\n    id\n    likesCount\n    isLikedByMe\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateAvatar($avatar: Upload!) {\n  updateAvatar(avatar: $avatar) {\n    id\n    avatarUrl\n  }\n}"): (typeof documents)["mutation UpdateAvatar($avatar: Upload!) {\n  updateAvatar(avatar: $avatar) {\n    id\n    avatarUrl\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateProfile($displayName: String, $bio: String) {\n  updateProfile(displayName: $displayName, bio: $bio) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n  }\n}"): (typeof documents)["mutation UpdateProfile($displayName: String, $bio: String) {\n  updateProfile(displayName: $displayName, bio: $bio) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UserByUsername($username: String!) {\n  userByUsername(username: $username) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n    tweetsCount\n    followersCount\n    followingCount\n    isFollowedByMe\n    createdAt\n  }\n}"): (typeof documents)["query UserByUsername($username: String!) {\n  userByUsername(username: $username) {\n    id\n    username\n    displayName\n    bio\n    avatarUrl\n    tweetsCount\n    followersCount\n    followingCount\n    isFollowedByMe\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UserTweets($uuid: ID!, $first: Int, $after: String) {\n  userTweets(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): (typeof documents)["query UserTweets($uuid: ID!, $first: Int, $after: String) {\n  userTweets(uuid: $uuid, first: $first, after: $after) {\n    edges {\n      node {\n        id\n        content\n        createdAt\n        likesCount\n        isLikedByMe\n        author {\n          id\n          username\n          displayName\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;