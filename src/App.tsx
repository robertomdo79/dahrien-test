import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from '@/layouts';
import { HomePage } from '@/pages/Home';
import { SpaceDetailPage } from '@/pages/Spaces';
import { ReservationsPage, NewReservationPage } from '@/pages/Reservations';
import { IoTDashboardPage } from '@/pages/Admin';

function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#14b8a6',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Home / Spaces List */}
          <Route index element={<HomePage />} />
          
          {/* Space Details */}
          <Route path="spaces/:id" element={<SpaceDetailPage />} />
          
          {/* Reservations */}
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="reservations/new" element={<NewReservationPage />} />
          
          {/* Admin / IoT Dashboard */}
          <Route path="admin/iot" element={<IoTDashboardPage />} />
          
          {/* 404 - Catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Simple 404 page
function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-bold text-surface-200 font-display mb-4">404</div>
      <h1 className="text-2xl font-semibold text-surface-900 mb-2">Page Not Found</h1>
      <p className="text-surface-500 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25"
      >
        Go back home
      </a>
    </div>
  );
}

export default App;
