class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :uuid, null: false
      t.string :username, null: false
      t.string :display_name, null: false
      t.text :bio
      t.integer :tweets_count, null: false, default: 0
      t.integer :followers_count, null: false, default: 0
      t.integer :following_count, null: false, default: 0

      t.timestamps
    end

    add_index :users, :uuid, unique: true
    add_index :users, :username, unique: true
  end
end
