import type { TypedDocumentNode } from '@apollo/client'
import Timeline from '../documents/Timeline.graphql'
import PublicTimeline from '../documents/PublicTimeline.graphql'
import UserTweets from '../documents/UserTweets.graphql'
import CreateTweet from '../documents/CreateTweet.graphql'
import DeleteTweet from '../documents/DeleteTweet.graphql'
import type { TimelineData, PublicTimelineData, CreateTweetData, DeleteTweetData } from '../types'

export const TIMELINE_QUERY = Timeline as TypedDocumentNode<TimelineData>
export const PUBLIC_TIMELINE_QUERY = PublicTimeline as TypedDocumentNode<PublicTimelineData>
export const USER_TWEETS_QUERY = UserTweets
export const CREATE_TWEET_MUTATION = CreateTweet as TypedDocumentNode<CreateTweetData>
export const DELETE_TWEET_MUTATION = DeleteTweet as TypedDocumentNode<DeleteTweetData>
