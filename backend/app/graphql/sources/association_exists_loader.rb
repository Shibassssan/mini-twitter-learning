module Sources
  class AssociationExistsLoader < GraphQL::Dataloader::Source
    def initialize(model_class, foreign_key, scope_key, scope_value)
      @model_class = model_class
      @foreign_key = foreign_key
      @scope_key = scope_key
      @scope_value = scope_value
    end

    def fetch(ids)
      existing_ids = @model_class
        .where(@scope_key => @scope_value, @foreign_key => ids)
        .pluck(@foreign_key)
        .to_set

      ids.map { |id| existing_ids.include?(id) }
    end
  end
end
