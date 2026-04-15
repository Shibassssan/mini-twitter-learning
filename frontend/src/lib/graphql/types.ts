export interface AuthUser {
  id: string
  username: string
  displayName: string
}

export interface AuthPayload {
  accessToken: string
  user: AuthUser
}

export interface RefreshTokenData {
  refreshToken: AuthPayload
}

export interface SignInData {
  signIn: AuthPayload
}

export interface SignUpData {
  signUp: AuthPayload
}

export interface SignOutData {
  signOut: boolean
}

export interface TweetNode {
  id: string
  content: string
  createdAt: string
  likesCount: number
  isLikedByMe: boolean
  author: AuthUser
}

interface TweetEdge {
  node: TweetNode
  cursor: string
}

interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

interface TweetConnection {
  edges: TweetEdge[]
  pageInfo: PageInfo
}

export interface TimelineData {
  timeline: TweetConnection
}

export interface PublicTimelineData {
  publicTimeline: TweetConnection
}

export interface CreateTweetData {
  createTweet: TweetNode
}

export interface DeleteTweetData {
  deleteTweet: boolean
}
