import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Variáveis de ambiente do Supabase não definidas corretamente.")
}

// Criar cliente Supabase
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// Helper function to get the correct table name based on environment
export function getVideoTableName() {
  return process.env.NODE_ENV === "production" ? "videosprod" : "videos"
}

// Improved test function with better error handling
export async function testSupabaseConnection() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase environment variables are missing")
      return {
        success: false,
        error: "Environment variables not set",
        details: {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      }
    }

    // Test connection by making a simple query
    const tableName = getVideoTableName()
    console.log(`Testing Supabase connection (table: ${tableName})...`)

    const { error } = await supabase.from(tableName).select("id").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
        },
      }
    }

    console.log("Supabase connection test successful")
    return {
      success: true,
      message: "Connection successful",
    }
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Function to ensure storage bucket exists
export async function ensureStorageBucket() {
  try {
    // Check if the bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error listing storage buckets:", error)
      return false
    }

    const videoBucket = buckets.find((bucket) => bucket.name === "videos")

    if (!videoBucket) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("videos", {
        public: true,
      })

      if (createError) {
        console.error("Error creating 'videos' bucket:", createError)
        return false
      }

      console.log("'videos' bucket created successfully")
    } else {
      console.log("'videos' bucket already exists")
    }

    return true
  } catch (error) {
    console.error("Error checking/creating storage bucket:", error)
    return false
  }
}
