export function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-surface-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-semibold text-surface-700">SGRET</span>
            <span>Workspace Reservation System</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-surface-400">
            <a href="#" className="hover:text-primary-600 transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              API Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
