class AddTrgmIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :users, :username, using: :gin, opclass: :gin_trgm_ops, name: "index_users_on_username_trgm"
    add_index :users, :display_name, using: :gin, opclass: :gin_trgm_ops, name: "index_users_on_display_name_trgm"
    add_index :tweets, :content, using: :gin, opclass: :gin_trgm_ops, name: "index_tweets_on_content_trgm"
  end
end
