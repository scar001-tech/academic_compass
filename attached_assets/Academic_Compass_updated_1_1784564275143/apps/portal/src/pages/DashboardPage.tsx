import { PortalLayout } from '../layouts/PortalLayout'

export function DashboardPage() {
  return (
    <PortalLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-900">1,245</p>
            <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Teachers</h3>
            <p className="text-3xl font-bold text-blue-900">87</p>
            <p className="text-xs text-gray-500 mt-2">All active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Attendance Rate</h3>
            <p className="text-3xl font-bold text-green-600">94%</p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Fee Collection</h3>
            <p className="text-3xl font-bold text-orange-600">87%</p>
            <p className="text-xs text-gray-500 mt-2">KES 2.5M collected</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Admissions</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <p className="font-medium text-gray-900">Student Name {i}</p>
                  <p className="text-sm text-gray-600">Class {i}A - {new Date().toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-4 border-blue-900 pl-4 py-2">
                  <p className="font-medium text-gray-900">Event {i}</p>
                  <p className="text-sm text-gray-600">Due on {new Date(Date.now() + i * 86400000).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
