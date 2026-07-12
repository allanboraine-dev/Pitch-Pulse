import { uploadFixtures } from '@/app/actions/fixtures'
import Link from 'next/link'

export default function FixtureLoaderPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white font-sans">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link href="/manager/dashboard" className="text-blue-500 hover:text-blue-400 font-bold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black mb-2">Bulk Load Fixtures</h1>
          <p className="text-gray-400 text-lg">Upload a CSV file to generate the season schedule.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4">CSV Format Requirements</h3>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
            <li>Must have exactly 5 columns.</li>
            <li><strong>Format:</strong> <code className="bg-gray-800 px-2 py-1 rounded">Home Team, Away Team, ISO Date, Season, Max Overs</code></li>
            <li><strong>Example:</strong> <code className="bg-gray-800 px-2 py-1 rounded">Lions, Titans, 2026-11-20T14:30:00Z, Summer 2026, 20</code></li>
            <li>If a team doesn't exist, it will be automatically created.</li>
          </ul>

          <form action={uploadFixtures} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Select CSV File</label>
              <input 
                type="file" 
                name="csvFile" 
                accept=".csv"
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all"
            >
              Upload & Generate Fixtures
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
