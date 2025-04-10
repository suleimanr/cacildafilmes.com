import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  console.log("Starting Supabase connection test...")

  try {
    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV || "not defined",
    }

    console.log("Environment variables status:", envStatus)

    // If environment variables are missing, return early with error
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Supabase environment variables are not set",
          envStatus,
        },
        { status: 500 },
      )
    }

    // Test videos table
    const videosTable = process.env.NODE_ENV === "production" ? "videosprod" : "videos"
    console.log(`Testing access to ${videosTable} table...`)

    let videosSuccess = false
    let videosError = null
    let videosCount = null

    try {
      const { data, error, count } = await supabase.from(videosTable).select("*", { count: "exact" }).limit(1)

      videosSuccess = !error
      videosError = error ? error.message : null
      videosCount = count
    } catch (err) {
      console.error(`Error accessing ${videosTable} table:`, err)
      videosError = err instanceof Error ? err.message : String(err)
    }

    // Test knowledge base table
    const knowledgeTable = process.env.NODE_ENV === "production" ? "knowledge_base_prod" : "knowledge_base"
    console.log(`Testing access to ${knowledgeTable} table...`)

    let knowledgeSuccess = false
    let knowledgeError = null
    let knowledgeCount = null

    try {
      const { data, error, count } = await supabase.from(knowledgeTable).select("*", { count: "exact" }).limit(1)

      knowledgeSuccess = !error
      knowledgeError = error ? error.message : null
      knowledgeCount = count
    } catch (err) {
      console.error(`Error accessing ${knowledgeTable} table:`, err)
      knowledgeError = err instanceof Error ? err.message : String(err)
    }

    // Test storage
    console.log("Testing access to storage...")

    let storageSuccess = false
    let storageError = null
    let bucketsList = []

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()

      storageSuccess = !error
      storageError = error ? error.message : null
      bucketsList = buckets || []
    } catch (err) {
      console.error("Error accessing storage:", err)
      storageError = err instanceof Error ? err.message : String(err)
    }

    // Prepare result
    const result = {
      success: videosSuccess, // Overall success depends on videos table access
      message: videosSuccess ? "Supabase connection successful" : "Supabase connection failed",
      details: {
        videos: {
          table: videosTable,
          success: videosSuccess,
          count: videosCount,
          error: videosError,
        },
        knowledge: {
          table: knowledgeTable,
          success: knowledgeSuccess,
          count: knowledgeCount,
          error: knowledgeError,
        },
        storage: {
          success: storageSuccess,
          buckets: bucketsList.map((b) => b.name),
          error: storageError,
        },
      },
      envStatus,
    }

    console.log("Connection test completed:", result.success ? "SUCCESS" : "FAILED")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected error during Supabase connection test:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error testing Supabase connection",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
