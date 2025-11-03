import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

function loadEnvOnce(file) {
  const fullPath = resolve(process.cwd(), file)
  if (!existsSync(fullPath)) return

  const contents = readFileSync(fullPath, "utf8")
  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue
    const idx = line.indexOf("=")
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    if (!key || process.env[key] !== undefined) continue
    const value = line.slice(idx + 1).trim()
    if (!value) continue
    process.env[key] = value
  }
}

loadEnvOnce(".env.local")
loadEnvOnce(".env")

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_LOGO_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_LOGO_BUCKET || "logos"

  if (!url) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  const supabase = createClient(url, serviceKey)

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    throw listError
  }

  const exists = buckets?.some((b) => b.name === bucket)

  if (!exists) {
    console.log(`Creating storage bucket "${bucket}"...`)
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg"],
      fileSizeLimit: "10MB",
    })

    if (error) {
      throw error
    }
  } else {
    console.log(`Bucket "${bucket}" already exists.`)
  }

  console.log(`Updating bucket "${bucket}" configuration...`)
  const { error: updateError } = await supabase.storage.updateBucket(bucket, {
    public: true,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg"],
    fileSizeLimit: "10MB",
  })

  if (updateError) {
    throw updateError
  }

  console.log("Done. Bucket is ready to store PNG and JPG assets.")
}

main().catch((err) => {
  console.error("Failed to setup Supabase storage:", err.message ?? err)
  process.exitCode = 1
})
