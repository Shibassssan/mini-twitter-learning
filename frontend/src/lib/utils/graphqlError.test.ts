import { describe, expect, it } from 'vitest'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { extractGqlErrorMessage } from './graphqlError'

describe('extractGqlErrorMessage', () => {
  describe('CombinedGraphQLErrors の場合', () => {
    it('最初の GraphQL エラーメッセージを返す', () => {
      const error = new CombinedGraphQLErrors({
        errors: [
          { message: 'メールアドレスは既に使用されています' },
          { message: '別のエラー' },
        ],
      })

      expect(extractGqlErrorMessage(error)).toBe(
        'メールアドレスは既に使用されています',
      )
    })

    it('エラーメッセージが空の場合は Error.message にフォールバックする', () => {
      const error = new CombinedGraphQLErrors({
        errors: [{ message: '' }],
      })

      // 空の GraphQL メッセージ → CombinedGraphQLErrors 自体の message が使われる
      const result = extractGqlErrorMessage(error, '投稿に失敗しました')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('通常の Error の場合', () => {
    it('Error.message を返す', () => {
      const error = new Error('セッションが無効です')
      expect(extractGqlErrorMessage(error)).toBe('セッションが無効です')
    })

    it('Failed to fetch をネットワークエラーに変換する', () => {
      const error = new Error('Failed to fetch')
      expect(extractGqlErrorMessage(error)).toBe(
        'ネットワークエラーが発生しました',
      )
    })

    it('空メッセージの Error はフォールバックを返す', () => {
      const error = new Error('')
      expect(extractGqlErrorMessage(error, 'ログインに失敗しました')).toBe(
        'ログインに失敗しました',
      )
    })
  })

  describe('その他の値の場合', () => {
    it('文字列はフォールバックを返す', () => {
      expect(extractGqlErrorMessage('unknown error')).toBe(
        'エラーが発生しました',
      )
    })

    it('null はフォールバックを返す', () => {
      expect(extractGqlErrorMessage(null)).toBe('エラーが発生しました')
    })

    it('undefined はフォールバックを返す', () => {
      expect(extractGqlErrorMessage(undefined)).toBe('エラーが発生しました')
    })

    it('カスタムフォールバックを使用する', () => {
      expect(extractGqlErrorMessage(42, '処理に失敗しました')).toBe(
        '処理に失敗しました',
      )
    })
  })
})
