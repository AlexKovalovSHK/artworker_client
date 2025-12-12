export interface UserUpdateDto {
  id: string
  email: string
  username?: string | null
  first_name?: string | null
  last_name?: string | null
}
