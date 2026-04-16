# frozen_string_literal: true

class AddTweetsCursorIndex < ActiveRecord::Migration[8.1]
  def change
    add_index :tweets, [ :created_at, :id ], order: { created_at: :desc, id: :desc },
              name: "index_tweets_on_created_at_desc_id_desc"
  end
end
