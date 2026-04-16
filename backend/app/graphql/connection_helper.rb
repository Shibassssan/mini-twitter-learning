module ConnectionHelper
  DEFAULT_PAGE_SIZE = 20
  MAX_PAGE_SIZE = 100

  private

  # paging_by:
  #   :primary — relation のモデルテーブルの created_at / id
  #   :likes    — likes.created_at / likes.id（Tweet + likes JOIN 用）
  #   :follows  — follows.created_at / follows.id（User + follows JOIN 用）
  def paginate_relation(relation, first:, after: nil, paging_by: :primary)
    limit = normalize_page_size(first)
    table = relation.klass.table_name

    ordered =
      case paging_by
      when :likes
        relation.order(Arel.sql("likes.created_at DESC, likes.id DESC"))
      when :follows
        relation.order(Arel.sql("follows.created_at DESC, follows.id DESC"))
      else
        relation.order(Arel.sql("#{table}.created_at DESC, #{table}.id DESC"))
      end

    cursor_columns =
      case paging_by
      when :likes
        "likes.created_at, likes.id"
      when :follows
        "follows.created_at, follows.id"
      else
        "#{table}.created_at, #{table}.id"
      end

    paged = after.present? ? apply_tuple_cursor(ordered, cursor_columns, after) : ordered

    records = paged.limit(limit + 1).to_a
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

  def apply_tuple_cursor(relation, columns_sql, after)
    created_at, id = decode_cursor(after)

    relation.where("(#{columns_sql}) < (?, ?)", created_at, id)
  end

  def encode_cursor(record)
    created_at, id = cursor_pair(record)
    Base64.strict_encode64("#{created_at.iso8601(6)}|#{id}")
  end

  def cursor_pair(record)
    if record.has_attribute?(:cursor_created_at) && record.read_attribute(:cursor_created_at).present?
      [ record.read_attribute(:cursor_created_at), record.read_attribute(:cursor_id) ]
    else
      [ record.created_at, record.id ]
    end
  end

  def decode_cursor(cursor)
    created_at, id = Base64.decode64(cursor).split("|", 2)

    raise_validation_error!("Invalid cursor") if created_at.blank? || id.blank?

    [ Time.iso8601(created_at), Integer(id, 10) ]
  rescue ArgumentError
    raise_validation_error!("Invalid cursor")
  end
end
