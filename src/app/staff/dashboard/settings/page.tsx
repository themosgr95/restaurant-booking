import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          
          {/* Option 1: Locations */}
          <Link href="/staff/dashboard/settings/locations" className="block">
            <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-500 transition-colors">
              <div>
                <h3 className="font-semibold text-gray-900">Locations & Hours</h3>
                <p className="text-sm text-gray-500">Manage opening times and special closures.</p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Link>

          {/* Option 2: Tables */}
          <Link href="/staff/dashboard/settings/tables" className="block">
            <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-indigo-500 transition-colors">
              <div>
                <h3 className="font-semibold text-gray-900">Tables</h3>
                <p className="text-sm text-gray-500">Add tables, capacities, and zones.</p>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}