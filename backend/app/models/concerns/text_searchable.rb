# frozen_string_literal: true

# ILIKE 検索の最低文字数とサニタイズを共通化する。
module TextSearchable
  extend ActiveSupport::Concern

  MIN_SUBSTRING_QUERY_LENGTH = 3

  class_methods do
    def normalize_search_query!(raw)
      q = raw.to_s.strip
      if q.length < MIN_SUBSTRING_QUERY_LENGTH
        raise ArgumentError, "Search query must be at least #{MIN_SUBSTRING_QUERY_LENGTH} characters"
      end

      "%#{ActiveRecord::Base.sanitize_sql_like(q)}%"
    end
  end
end
