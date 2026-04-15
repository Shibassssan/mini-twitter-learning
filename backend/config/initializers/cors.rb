frontend_origins = ENV.fetch("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map(&:strip)
  .reject(&:blank?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*frontend_origins)

    resource "/graphql",
      headers: :any,
      methods: [ :post, :options ],
      credentials: true

    resource "/cable",
      headers: :any,
      methods: [ :get, :options ],
      credentials: true
  end
end
