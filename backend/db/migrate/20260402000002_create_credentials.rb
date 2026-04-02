class CreateCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :credentials do |t|
      t.string :uuid, null: false
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :email, null: false
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :credentials, :uuid, unique: true
    add_index :credentials, :email, unique: true
  end
end
