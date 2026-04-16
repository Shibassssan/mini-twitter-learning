# frozen_string_literal: true

# Apollo Upload / Rack::Test::UploadedFile など、io 相当のオブジェクトを検証して ActiveStorage に載せる。
module AvatarUploadable
  extend ActiveSupport::Concern

  MAX_AVATAR_FILE_SIZE = 2.megabytes
  ALLOWABLE_AVATAR_CONTENT_TYPES = %w[image/jpeg image/png image/webp].freeze

  def attach_avatar_upload!(upload)
    ActiveRecord::Base.transaction do
      validate_avatar_upload!(upload)

      avatar.attach(
        io: upload,
        filename: upload.original_filename,
        content_type: upload.content_type
      )
      self
    end
  end

  def validate_avatar_upload!(upload)
    io = upload.respond_to?(:tempfile) && upload.tempfile ? upload.tempfile : upload
    io.rewind if io.respond_to?(:rewind)
    detected_type = Marcel::MimeType.for(io, name: upload.original_filename)
    io.rewind if io.respond_to?(:rewind)

    unless ALLOWABLE_AVATAR_CONTENT_TYPES.include?(detected_type)
      raise ArgumentError, "Avatar must be JPEG, PNG, or WebP"
    end

    if upload.size > MAX_AVATAR_FILE_SIZE
      raise ArgumentError, "Avatar must be less than 2MB"
    end

    true
  end
end
