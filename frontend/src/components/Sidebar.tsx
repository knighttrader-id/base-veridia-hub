import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  ShoppingCart,
  User,
  X,
  FileText,
  Database,
  Shield,
  DollarSign,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Karya', href: '/upload', icon: Upload },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { name: 'Registri HKI', href: '/ip-registry', icon: Database },
    { name: 'Keuangan', href: '/financial', icon: DollarSign },
    { name: 'Manajemen User', href: '/user-management', icon: User },
    { name: 'Regulator', href: '/regulator', icon: Shield },
    { name: 'Admin Tools', href: '/admin-tools', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-red-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">VeridiaHub</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-red-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2025 VeridiaHub Platform
          </div>
        </div>
      </div>
    </>
  );
}