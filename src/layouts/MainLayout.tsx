import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components/layout';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-50 via-white to-primary-50/30">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="flex-1 pt-28 pb-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
