import SupabaseConnectionTest from "@/components/SupabaseConnectionTest"

export const dynamic = "force-dynamic" // Disable static optimization for this route

export default function TestSupabasePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Supabase Connection Test</h1>
      <SupabaseConnectionTest />
    </div>
  )
}
