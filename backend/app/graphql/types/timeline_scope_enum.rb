module Types
  class TimelineScopeEnum < Types::BaseEnum
    value "FOLLOWING", "フォロー中ユーザーのツイート"
    value "GLOBAL", "全ユーザーのツイート"
  end
end
