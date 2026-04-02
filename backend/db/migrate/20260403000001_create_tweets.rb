class CreateTweets < ActiveRecord::Migration[8.1]
  def change
    create_table :tweets do |t|
      t.string :uuid, null: false
      t.references :user, null: false, foreign_key: true
      t.string :content, null: false, limit: 300
      t.integer :likes_count, null: false, default: 0

      t.timestamps
    end

    add_index :tweets, :uuid, unique: true
    add_index :tweets, [ :user_id, :created_at ]
  end
end
