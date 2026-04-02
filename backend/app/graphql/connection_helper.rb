module ConnectionHelper
  DEFAULT_PAGE_SIZE = 20
  MAX_PAGE_SIZE = 100

  private

  def paginate_relation(relation, first:, after:)
    limit = normalize_page_size(first)
    scoped_relation = relation.order(created_at: :desc, id: :desc)
    scoped_relation = apply_cursor(scoped_relation, after) if after.present?

    records = scoped_relation.limit(limit + 1).to_a
    has_next_page = records.length > limit
    records = records.first(limit)

    {
      edges: records.map { |record| { node: record, cursor: encode_cursor(record) } },
      page_info: {
        has_next_page: has_next_page,
        end_cursor: records.last ? encode_cursor(records.last) : nil
      }
    }
  end

  def normalize_page_size(first)
    requested_size = first.presence || DEFAULT_PAGE_SIZE
    requested_size.to_i.clamp(1, MAX_PAGE_SIZE)
  end

  def apply_cursor(relation, after)
    created_at, id = decode_cursor(after)

    relation.where(
      "created_at < :created_at OR (created_at = :created_at AND id < :id)",
      created_at: created_at,
      id: id
    )
  end

  def encode_cursor(record)
    Base64.strict_encode64("#{record.created_at.iso8601(6)}|#{record.id}")
  end

  def decode_cursor(cursor)
    created_at, id = Base64.decode64(cursor).split("|", 2)

    raise_validation_error!("Invalid cursor") if created_at.blank? || id.blank?

    [ Time.iso8601(created_at), Integer(id, 10) ]
  rescue ArgumentError
    raise_validation_error!("Invalid cursor")
  end
end
