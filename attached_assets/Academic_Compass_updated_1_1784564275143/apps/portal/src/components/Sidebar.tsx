import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@shared/types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: string;
};

const navItems: NavItem[] = [
  // Available to all authenticated users
  {
    label: 'Dashboard',
    path: '/portal',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: [
      UserRole.PRINCIPAL,
      UserRole.SENIOR_TEACHER,
      UserRole.TEACHER,
      UserRole.DEPARTMENT_HEAD,
      UserRole.VICE_PRINCIPAL,
    ],
  },

  // Student Management - Principal, Senior Teacher
  {
    label: 'Students',
    path: '/portal/students',
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.PRINCIPAL, UserRole.SENIOR_TEACHER],
  },

  // Timetable - Principal, Senior Teacher, Teachers
  {
    label: 'Timetable',
    path: '/portal/timetable',
    icon: <Calendar className="h-5 w-5" />,
    roles: [
      UserRole.PRINCIPAL,
      UserRole.SENIOR_TEACHER,
      UserRole.TEACHER,
      UserRole.DEPARTMENT_HEAD,
    ],
  },

  // Teachers - Principal, Senior Teacher
  {
    label: 'Teachers',
    path: '/portal/teachers',
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.PRINCIPAL, UserRole.SENIOR_TEACHER],
  },

  // Marks & Grades
  {
    label: 'Marks',
    path: '/portal/marks',
    icon: <TrendingUp className="h-5 w-5" />,
    roles: [
      UserRole.PRINCIPAL,
      UserRole.SENIOR_TEACHER,
      UserRole.TEACHER,
      UserRole.DEPARTMENT_HEAD,
    ],
  },

  // Academics
  {
    label: 'Academics',
    path: '/portal/academics',
    icon: <BookOpen className="h-5 w-5" />,
    roles: [
      UserRole.PRINCIPAL,
      UserRole.SENIOR_TEACHER,
      UserRole.TEACHER,
      UserRole.DEPARTMENT_HEAD,
    ],
  },

  // Reports & Analytics - Principal, Department Head
  {
    label: 'Reports',
    path: '/portal/reports',
    icon: <FileText className="h-5 w-5" />,
    roles: [
      UserRole.PRINCIPAL,
      UserRole.SENIOR_TEACHER,
      UserRole.DEPARTMENT_HEAD,
    ],
  },

  // Finance - Principal, Accountant
  {
    label: 'Finance',
    path: '/portal/finance',
    icon: <DollarSign className="h-5 w-5" />,
    roles: [UserRole.PRINCIPAL, UserRole.ACCOUNTANT],
  },

  // Settings - Principal only
  {
    label: 'Settings',
    path: '/portal/settings',
    icon: <Settings className="h-5 w-5" />,
    roles: [UserRole.PRINCIPAL],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Filter navigation items based on user role
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b 
          from-blue-900 to-blue-800 text-white transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">AC</span>
            </div>
            <span className="font-bold text-lg">Portal</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden hover:bg-blue-700 p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-blue-700">
          <div className="text-sm">
            <p className="font-semibold text-blue-100">User Role</p>
            <p className="text-blue-200 mt-1 text-xs uppercase tracking-wide">
              {userRole.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200 text-left font-medium
                ${
                  isActive(item.path)
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700/50'
                }
              `}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-xs font-bold px-2 py-1 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-blue-700 p-4 space-y-2">
          <p className="text-xs text-blue-200 px-4">
            Internal Portal - Not Public
          </p>
          <button
            onClick={() => navigate('/logout')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-blue-100 hover:bg-red-600 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
