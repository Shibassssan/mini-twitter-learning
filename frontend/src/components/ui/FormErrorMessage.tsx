interface FormErrorMessageProps {
  id?: string
  message?: string
}

export function FormErrorMessage({ id, message }: FormErrorMessageProps) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-danger text-xs mt-1">
      {message}
    </p>
  )
}
