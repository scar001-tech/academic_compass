import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole, Permission, RolePermissions } from '@shared/types';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurePortalLayoutProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
}

/**
 * Main secure portal layout with RBAC
 * Only authenticated users can access this layout
 * Navigation and content adapts based on user role
 */
export const SecurePortalLayout: React.FC<SecurePortalLayoutProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You must be authenticated to access this portal
          </p>
          <a
            href="/login"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Insufficient Permissions</h1>
          <p className="text-gray-600 mt-2">
            Your role ({user.role}) does not have access to this page
          </p>
          <a
            href="/portal"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const userPermissions = RolePermissions[user.role] || [];
    const hasPermission = requiredPermissions.some((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">
              Insufficient Permissions
            </h1>
            <p className="text-gray-600 mt-2">
              You do not have permission to access this resource
            </p>
            <a
              href="/portal"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={logout}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* User Role Badge */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">
                  Logged in as: <strong>{user.name}</strong> ({user.role})
                </span>
              </div>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

/**
 * HOC to protect routes with role/permission checks
 */
export const withSecurePortal = (
  Component: React.ComponentType<any>,
  options: {
    requiredPermissions?: Permission[];
    requiredRoles?: UserRole[];
  } = {}
) => {
  return (props: any) => (
    <SecurePortalLayout
      requiredPermissions={options.requiredPermissions}
      requiredRoles={options.requiredRoles}
    >
      <Component {...props} />
    </SecurePortalLayout>
  );
};
