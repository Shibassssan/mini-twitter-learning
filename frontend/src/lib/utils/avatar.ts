export const AVATAR_MAX_FILE_SIZE = 2 * 1024 * 1024
export const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type AvatarValidationResult =
  | { valid: true }
  | { valid: false; message: string }

export function getInitials(displayName: string) {
  return displayName.trim().slice(0, 2).toUpperCase() || '?'
}

export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: 'JPEG、PNG、WebP形式の画像を選択してください',
    }
  }

  if (file.size > AVATAR_MAX_FILE_SIZE) {
    return {
      valid: false,
      message: 'ファイルサイズは2MB以下にしてください',
    }
  }

  return { valid: true }
}
