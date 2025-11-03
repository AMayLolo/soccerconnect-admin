const SUPER_ADMIN_EMAILS_RAW = [
  "abby.lossa@gmail.com",
  "abby.lossa@marsh.com",
  "admin@soccerconnectusa.com",
] as const

const SUPER_ADMIN_EMAIL_SET = new Set(SUPER_ADMIN_EMAILS_RAW.map((email) => email.toLowerCase()))

export const SUPER_ADMIN_EMAILS = [...SUPER_ADMIN_EMAIL_SET]

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return SUPER_ADMIN_EMAIL_SET.has(email.toLowerCase())
}
