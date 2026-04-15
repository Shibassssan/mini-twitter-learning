import type { TypedDocumentNode } from '@apollo/client'
import SignUp from '../documents/SignUp.graphql'
import SignIn from '../documents/SignIn.graphql'
import SignOut from '../documents/SignOut.graphql'
import RefreshToken from '../documents/RefreshToken.graphql'
import Me from '../documents/Me.graphql'
import type { SignUpData, SignInData, SignOutData, RefreshTokenData } from '../types'

export const SIGN_UP_MUTATION = SignUp as TypedDocumentNode<SignUpData>
export const SIGN_IN_MUTATION = SignIn as TypedDocumentNode<SignInData>
export const SIGN_OUT_MUTATION = SignOut as TypedDocumentNode<SignOutData>
export const REFRESH_TOKEN_MUTATION = RefreshToken as TypedDocumentNode<RefreshTokenData>
export const ME_QUERY = Me
