module Types
  class BaseField < GraphQL::Schema::Field
    argument_class Types::BaseArgument

    def initialize(*args, **kwargs, &block)
      kwargs[:complexity] = 1 if kwargs[:complexity].nil?
      super(*args, **kwargs, &block)
    end
  end
end
