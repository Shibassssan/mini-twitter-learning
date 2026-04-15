import { describe, expect, it } from 'vitest'
import { tweetSchema } from './tweet'

describe('tweetSchema', () => {
  it('有効なツイートでパースできる', () => {
    const result = tweetSchema.safeParse({ content: 'Hello, world!' })
    expect(result.success).toBe(true)
  })

  it('空文字でエラー', () => {
    const result = tweetSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'ツイートを入力してください',
      )
    }
  })

  it('300文字ちょうどでパスする', () => {
    const result = tweetSchema.safeParse({ content: 'あ'.repeat(300) })
    expect(result.success).toBe(true)
  })

  it('300文字超でエラー', () => {
    const result = tweetSchema.safeParse({ content: 'あ'.repeat(301) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'ツイートは300文字以内で入力してください',
      )
    }
  })

  it('1文字でパスする', () => {
    const result = tweetSchema.safeParse({ content: 'a' })
    expect(result.success).toBe(true)
  })
})
