import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-900">Drumvale School</h1>
            <div className="hidden md:flex gap-6">
              <a href="/" className="text-gray-700 hover:text-blue-900">Home</a>
              <a href="/about" className="text-gray-700 hover:text-blue-900">About</a>
              <a href="/academics" className="text-gray-700 hover:text-blue-900">Academics</a>
              <a href="/admissions" className="text-gray-700 hover:text-blue-900">Admissions</a>
              <a href="/news" className="text-gray-700 hover:text-blue-900">News</a>
              <a href="/contact" className="text-gray-700 hover:text-blue-900">Contact</a>
            </div>
          </div>
          <button className="text-blue-900 hover:bg-gray-100 px-4 py-2 rounded">
            Portal Login
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">About School</h3>
              <p className="text-gray-400 text-sm">
                Excellence Through Education
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Admissions</a></li>
                <li><a href="#" className="hover:text-white">Calendar</a></li>
                <li><a href="#" className="hover:text-white">Downloads</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <p className="text-sm text-gray-400">
                info@school.sch.ke<br/>
                +254 XXX XXX XXX
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4 text-sm">
                <a href="#" className="hover:text-blue-400">Facebook</a>
                <a href="#" className="hover:text-blue-400">Twitter</a>
                <a href="#" className="hover:text-blue-400">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Drumvale Secondary School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
