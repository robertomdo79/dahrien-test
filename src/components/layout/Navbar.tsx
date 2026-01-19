import { Link, useLocation } from 'react-router-dom';
import { 
  Squares2X2Icon, 
  CalendarDaysIcon, 
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import { useUserStore, isAdmin } from '@/context';
import type { UserRole } from '@/context';

const allNavigation = [
  { name: 'Spaces', href: '/', icon: Squares2X2Icon, adminOnly: false },
  { name: 'Reservations', href: '/reservations', icon: CalendarDaysIcon, adminOnly: false },
  { name: 'IoT Dashboard', href: '/admin/iot', icon: ChartBarIcon, adminOnly: true },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, setRole } = useUserStore();
  const userIsAdmin = isAdmin(currentUser);

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => !item.adminOnly || userIsAdmin);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-surface-900/5">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg font-display">S</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold font-display bg-gradient-to-r from-surface-900 to-surface-600 bg-clip-text text-transparent">
                  SGRET
                </span>
                <span className="text-xs text-surface-400 block -mt-1">Workspace Hub</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Dropdown & Mobile menu button */}
            <div className="flex items-center gap-2">
              {/* User Role Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    'bg-surface-50 hover:bg-surface-100 text-surface-700',
                    userMenuOpen && 'bg-surface-100'
                  )}
                >
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center',
                    userIsAdmin 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-br from-primary-400 to-primary-600'
                  )}>
                    {userIsAdmin ? (
                      <ShieldCheckIcon className="h-5 w-5 text-white" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-surface-900 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-surface-500 leading-tight capitalize">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDownIcon className={cn(
                    'h-4 w-4 text-surface-400 transition-transform duration-200',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl shadow-surface-900/10 border border-surface-100 overflow-hidden animate-fade-in z-50">
                    {/* Current User Info */}
                    <div className="px-4 py-3 bg-surface-50 border-b border-surface-100">
                      <p className="text-xs text-surface-500 uppercase tracking-wider font-medium mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-medium text-surface-900">{currentUser.name}</p>
                      <p className="text-xs text-surface-500">{currentUser.email}</p>
                    </div>

                    {/* Role Switch Options */}
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs text-surface-400 uppercase tracking-wider font-medium">
                        Switch View
                      </p>
                      
                      {/* Admin Option */}
                      <button
                        onClick={() => handleRoleChange('admin')}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                          currentUser.role === 'admin'
                            ? 'bg-amber-50 text-amber-700'
                            : 'hover:bg-surface-50 text-surface-700'
                        )}
                      >
                        <div className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center',
                          'bg-gradient-to-br from-amber-400 to-orange-500'
                        )}>
                          <ShieldCheckIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">Admin User</p>
                          <p className="text-xs text-surface-500">Full access to all features</p>
                        </div>
                        {currentUser.role === 'admin' && (
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </button>

                      {/* Normal User Option */}
                      <button
                        onClick={() => handleRoleChange('user')}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                          currentUser.role === 'user'
                            ? 'bg-primary-50 text-primary-700'
                            : 'hover:bg-surface-50 text-surface-700'
                        )}
                      >
                        <div className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center',
                          'bg-gradient-to-br from-primary-400 to-primary-600'
                        )}>
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">Robbie Mundo</p>
                          <p className="text-xs text-surface-500">robbiemdo79@gmail.com</p>
                        </div>
                        {currentUser.role === 'user' && (
                          <div className="h-2 w-2 rounded-full bg-primary-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 pb-4 space-y-1 animate-fade-in">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
