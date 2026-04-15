ActiveRecord::Base.transaction do
  Like.delete_all
  Follow.delete_all
  Tweet.delete_all
  Credential.delete_all
  User.delete_all

  user_data = [
    { username: "tanaka_yuki", display_name: "田中 裕紀", email: "tanaka@example.com", bio: "東京でWebエンジニアやってます。Rails と React が好き。" },
    { username: "sato_miki", display_name: "佐藤 美紀", email: "sato@example.com", bio: "デザインとコーヒーが好きなフリーランスデザイナー。" },
    { username: "suzuki_ken", display_name: "鈴木 健", email: "suzuki@example.com", bio: "バックエンドエンジニア。Go と Rust を勉強中。" },
    { username: "yamada_aoi", display_name: "山田 葵", email: "yamada@example.com", bio: "スタートアップでPMやってます。猫2匹と暮らしてる。" },
    { username: "ito_ren", display_name: "伊藤 蓮", email: "ito@example.com", bio: "大学院生。機械学習の研究してます。" },
  ]

  users = user_data.map do |data|
    user = User.create!(
      username: data[:username],
      display_name: data[:display_name],
      bio: data[:bio]
    )
    Credential.create!(
      user: user,
      email: data[:email],
      password: "password123",
      password_confirmation: "password123"
    )
    user
  end

  tanaka, sato, suzuki, yamada, ito = users

  tweets_data = {
    tanaka => [
      "Rails 8 の新機能を試してみた。Solid Queue がデフォルトになったの便利すぎる。",
      "今日は天気がいいのでテラス席で作業してる。最高。",
      "GraphQL の N+1 問題、dataloader で解決できた。もっと早く導入すればよかった。",
      "週末に技術書典で買った本がやっと読み終わった。型システムの本が特によかった。",
    ],
    sato => [
      "新しいポートフォリオサイトのデザインが完成した。Figma の新機能めちゃくちゃ使いやすい。",
      "渋谷の新しいカフェ、Wi-Fi も電源もあって作業しやすい。おすすめ。",
      "Tailwind CSS v4 のアップグレード完了。CSS-first の設定方式がすっきりしてる。",
    ],
    suzuki => [
      "Rust で書き直した API サーバー、レスポンスタイムが 10 分の 1 になった。",
      "Docker Compose で開発環境を整えたら新メンバーのオンボーディングが 30 分で終わるようになった。",
      "今週の技術ブログ書いた。テーマは goroutine のエラーハンドリングパターン。",
      "OSS にはじめてコントリビュートした。小さな修正だけどマージされて嬉しい。",
      "Kubernetes の勉強始めた。概念多すぎて頭がパンクしそう。",
    ],
    yamada => [
      "新機能のユーザーインタビュー終了。予想と全然違う使い方をしてる人がいて面白かった。",
      "OKR の振り返りミーティング完了。今期は目標の 80% 達成できた。",
      "リモートワーク中に猫がキーボードの上に乗ってきて謎のコードが入力された。",
    ],
    ito => [
      "論文の実験結果がやっと再現できた。パラメータの設定が微妙にズレてた。",
      "PyTorch 3.0 のコンパイルモード、学習速度が 1.5 倍になった。すごい。",
      "学会発表のスライド作成中。発表は来週なのにまだ半分しかできてない。",
      "研究室のサーバーが落ちて実験データが飛んだ。バックアップの大切さを痛感。",
    ],
  }

  all_tweets = []
  tweets_data.each do |user, contents|
    contents.each_with_index do |content, i|
      tweet = Tweet.create!(user: user, content: content, created_at: (contents.size - i).hours.ago)
      all_tweets << tweet
    end
  end

  follow_pairs = [
    [tanaka, sato], [tanaka, suzuki], [tanaka, yamada],
    [sato, tanaka], [sato, ito],
    [suzuki, tanaka], [suzuki, yamada], [suzuki, ito],
    [yamada, tanaka], [yamada, sato], [yamada, suzuki], [yamada, ito],
    [ito, suzuki], [ito, yamada],
  ]

  follow_pairs.each do |follower, followed|
    Follow.create!(follower: follower, followed: followed)
  end

  like_pairs = [
    [sato, all_tweets[0]], [suzuki, all_tweets[0]], [yamada, all_tweets[0]],
    [tanaka, all_tweets[4]], [ito, all_tweets[4]],
    [tanaka, all_tweets[7]], [sato, all_tweets[7]],
    [yamada, all_tweets[10]], [ito, all_tweets[10]],
    [tanaka, all_tweets[12]], [suzuki, all_tweets[12]],
    [sato, all_tweets[15]], [suzuki, all_tweets[15]], [yamada, all_tweets[15]],
    [tanaka, all_tweets[17]], [sato, all_tweets[17]],
  ]

  like_pairs.each do |user, tweet|
    Like.create!(user: user, tweet: tweet)
  end

  puts "Seeded: #{User.count} users, #{Tweet.count} tweets, #{Follow.count} follows, #{Like.count} likes"
end
