class CreateLikes < ActiveRecord::Migration[8.1]
  def change
    create_table :likes do |t|
      t.string :uuid, null: false
      t.references :user, null: false, foreign_key: true
      t.references :tweet, null: false, foreign_key: true

      t.timestamps
    end

    add_index :likes, :uuid, unique: true
    add_index :likes, [:user_id, :tweet_id], unique: true
  end
end
