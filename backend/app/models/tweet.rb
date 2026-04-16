class Tweet < ApplicationRecord
  include HasUuid
  include TextSearchable

  belongs_to :user, counter_cache: true
  has_many :likes, dependent: :destroy

  validates :content,
    presence: true,
    length: { maximum: 300 }

  def self.search_content_substring(query_string)
    pattern = normalize_search_query!(query_string)
    where("content ILIKE :q", q: pattern)
  end
end
