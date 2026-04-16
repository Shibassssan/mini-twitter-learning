import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from './auth'

describe('signUpSchema', () => {
  const validData = {
    username: 'test_user',
    displayName: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
  }

  it('有効なデータでパースできる', () => {
    const result = signUpSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  describe('username', () => {
    it('3文字未満でエラー', () => {
      const result = signUpSchema.safeParse({ ...validData, username: 'ab' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'ユーザー名は3文字以上で入力してください',
        )
      }
    })

    it('15文字超でエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        username: 'a'.repeat(16),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'ユーザー名は15文字以内で入力してください',
        )
      }
    })

    it('英数字とアンダースコア以外の文字でエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        username: 'user-name!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'ユーザー名は英数字とアンダースコアのみ使用できます',
        )
      }
    })

    it('3文字ちょうどでパスする', () => {
      const result = signUpSchema.safeParse({ ...validData, username: 'abc' })
      expect(result.success).toBe(true)
    })

    it('15文字ちょうどでパスする', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        username: 'a'.repeat(15),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('displayName', () => {
    it('空文字でエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        displayName: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '表示名を入力してください',
        )
      }
    })

    it('50文字超でエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        displayName: 'あ'.repeat(51),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '表示名は50文字以内で入力してください',
        )
      }
    })

    it('50文字ちょうどでパスする', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        displayName: 'あ'.repeat(50),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('email', () => {
    it('不正なメールアドレスでエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        email: 'invalid-email',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '有効なメールアドレスを入力してください',
        )
      }
    })
  })

  describe('password', () => {
    it('8文字未満でエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        password: '1234567',
        passwordConfirm: '1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'パスワードは8文字以上で入力してください',
        )
      }
    })

    it('8文字ちょうどでパスする', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        password: '12345678',
        passwordConfirm: '12345678',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('passwordConfirm', () => {
    it('パスワードと不一致でエラー', () => {
      const result = signUpSchema.safeParse({
        ...validData,
        passwordConfirm: 'different_password',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmIssue = result.error.issues.find((i) =>
          i.path.includes('passwordConfirm'),
        )
        expect(confirmIssue?.message).toBe('パスワードが一致しません')
      }
    })
  })
})

describe('signInSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
  }

  it('有効なデータでパースできる', () => {
    const result = signInSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('不正なメールアドレスでエラー', () => {
    const result = signInSchema.safeParse({ ...validData, email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '有効なメールアドレスを入力してください',
      )
    }
  })

  it('パスワード空文字でエラー', () => {
    const result = signInSchema.safeParse({ ...validData, password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'パスワードを入力してください',
      )
    }
  })
})
