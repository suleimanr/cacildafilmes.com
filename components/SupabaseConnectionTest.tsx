"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function SupabaseConnectionTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetchAttempts, setFetchAttempts] = useState(0)

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      // Add cache-busting parameter to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/test-supabase?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Supabase test result:", data)
      setResult(data)
    } catch (err) {
      console.error("Error testing connection:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Test connection automatically when component mounts
    // but limit to 3 attempts to prevent infinite loops
    if (fetchAttempts < 3) {
      testConnection()
      setFetchAttempts((prev) => prev + 1)
    }
  }, [fetchAttempts])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Test
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
        </CardTitle>
        <CardDescription>Verifies if the Supabase connection is working correctly</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error testing connection</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Overall status:</span>
              {result.success ? (
                <Badge variant="success" className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Connection failed
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Environment Variables</h3>
              <div className="grid grid-cols-2 gap-2">
                {result.envStatus &&
                  Object.entries(result.envStatus).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                      <span className="font-mono text-sm">{key}</span>
                      <Badge
                        variant={value === "Set" ? "outline" : "destructive"}
                        className={value === "Set" ? "bg-green-100" : "bg-red-100"}
                      >
                        {value}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            {result.details && (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Videos Table</h3>
                  <div className="p-3 bg-gray-100 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Table name:</span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-sm">{result.details.videos.table}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {result.details.videos.success ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Accessible
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          Access error
                        </Badge>
                      )}
                    </div>
                    {result.details.videos.count !== null && (
                      <div className="mt-2">
                        <span className="font-medium">Records count:</span> {result.details.videos.count}
                      </div>
                    )}
                    {result.details.videos.error && (
                      <div className="mt-2 text-red-600 text-sm">
                        <span className="font-medium">Error:</span> {result.details.videos.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Knowledge Base Table</h3>
                  <div className="p-3 bg-gray-100 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Table name:</span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-sm">{result.details.knowledge.table}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {result.details.knowledge.success ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Accessible
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          Access error
                        </Badge>
                      )}
                    </div>
                    {!result.details.knowledge.success && (
                      <div className="mt-2 flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          This table may not exist yet. This is normal if you haven't migrated the knowledge base.
                        </span>
                      </div>
                    )}
                    {result.details.knowledge.count !== null && (
                      <div className="mt-2">
                        <span className="font-medium">Records count:</span> {result.details.knowledge.count}
                      </div>
                    )}
                    {result.details.knowledge.error && (
                      <div className="mt-2 text-red-600 text-sm">
                        <span className="font-medium">Error:</span> {result.details.knowledge.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Storage</h3>
                  <div className="p-3 bg-gray-100 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {result.details.storage.success ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Accessible
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          Access error
                        </Badge>
                      )}
                    </div>
                    {result.details.storage.buckets && result.details.storage.buckets.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium">Available buckets:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.details.storage.buckets.map((bucket: string) => (
                            <Badge key={bucket} variant="outline" className="bg-blue-100">
                              {bucket}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.details.storage.error && (
                      <div className="mt-2 text-red-600 text-sm">
                        <span className="font-medium">Error:</span> {result.details.storage.error}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!result && !error && loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Testing Supabase connection...</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing connection...
            </>
          ) : (
            "Test connection again"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
