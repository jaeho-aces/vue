export type FormField = {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'yesno' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  rows?: number
}





