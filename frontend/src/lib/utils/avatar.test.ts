import { describe, expect, it } from 'vitest'
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_FILE_SIZE,
  getInitials,
  validateAvatarFile,
} from '@/lib/utils/avatar'

function imageFile(name: string, type: string, size: number) {
  return new File(['x'.repeat(size)], name, { type })
}

describe('avatar utils', () => {
  describe('getInitials', () => {
    it('表示名の先頭2文字を大文字で返す', () => {
      expect(getInitials('taro')).toBe('TA')
    })

    it('空文字のときは ? を返す', () => {
      expect(getInitials('')).toBe('?')
    })
  })

  describe('validateAvatarFile', () => {
    it('許可された画像形式とサイズなら valid を返す', () => {
      const file = imageFile('avatar.png', AVATAR_ACCEPTED_TYPES[1], 1024)

      expect(validateAvatarFile(file)).toEqual({ valid: true })
    })

    it('未対応のファイル形式ならエラーメッセージを返す', () => {
      const file = imageFile('avatar.gif', 'image/gif', 1024)

      expect(validateAvatarFile(file)).toEqual({
        valid: false,
        message: 'JPEG、PNG、WebP形式の画像を選択してください',
      })
    })

    it('上限サイズを超えるとエラーメッセージを返す', () => {
      const file = imageFile('avatar.png', 'image/png', AVATAR_MAX_FILE_SIZE + 1)

      expect(validateAvatarFile(file)).toEqual({
        valid: false,
        message: 'ファイルサイズは2MB以下にしてください',
      })
    })
  })
})
