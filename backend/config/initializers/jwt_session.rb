JWTSessions.algorithm = "HS256"
JWTSessions.encryption_key = Rails.application.secret_key_base

JWTSessions.token_store = :redis, {
  redis_url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0")
}

JWTSessions.access_exp_time = 1.hour.to_i
JWTSessions.refresh_exp_time = 2.weeks.to_i

JWTSessions.refresh_cookie = "refresh_token"
