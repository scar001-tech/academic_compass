import { ReactNode } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface PortalLayoutProps {
  children: ReactNode
  requiredRole?: string[]
}

export function PortalLayout({ children, requiredRole }: PortalLayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Check if user has required role
  if (requiredRole && !requiredRole.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white shadow-lg">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-bold">School Portal</h1>
          <p className="text-blue-200 text-sm mt-1">{user?.role}</p>
        </div>
        
        <nav className="p-6 space-y-2">
          <a href="/portal/dashboard" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Dashboard
          </a>
          <a href="/portal/students" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Students
          </a>
          <a href="/portal/teachers" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Teachers
          </a>
          <a href="/portal/marks" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Marks
          </a>
          <a href="/portal/attendance" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Attendance
          </a>
          <a href="/portal/finance" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Finance
          </a>
          <a href="/portal/settings" className="block px-4 py-2 rounded hover:bg-blue-800 transition">
            Settings
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Portal</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.firstName} {user?.lastName}</span>
            <button className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center">
              {user?.firstName?.charAt(0)}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
