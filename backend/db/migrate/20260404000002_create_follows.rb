class CreateFollows < ActiveRecord::Migration[8.1]
  def change
    create_table :follows do |t|
      t.string :uuid, null: false
      t.references :follower, null: false, foreign_key: { to_table: :users }
      t.references :followed, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :follows, :uuid, unique: true
    add_index :follows, [ :follower_id, :followed_id ], unique: true
  end
end
