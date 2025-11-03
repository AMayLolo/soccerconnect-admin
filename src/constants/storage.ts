export const LOGO_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_LOGO_BUCKET || "logos"

export const ALLOWED_LOGO_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"] as const

export type AllowedLogoMimeType = (typeof ALLOWED_LOGO_MIME_TYPES)[number]
