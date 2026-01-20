import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ReservationCard, ReservationFilters, EditReservationModal } from '@/components/reservations';
import { Button, Spinner, EmptyState, Card, ConfirmationModal } from '@/components/ui';
import { useReservations } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { useUserStore, isAdmin } from '@/context';
import type { Reservation, UpdateReservationDto } from '@/types';

export function ReservationsPage() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const userIsAdmin = isAdmin(currentUser);
  
  // For normal users, email filter is locked to their email
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(5);

  // Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Debounce email filter
  const debouncedEmail = useDebounce(emailFilter, 500);

  // Determine the effective email filter based on user role
  const effectiveEmailFilter = userIsAdmin ? debouncedEmail : currentUser.email;

  const { 
    reservations, 
    isLoading, 
    isSubmitting,
    pagination, 
    goToPage,
    cancelReservation,
    deleteReservation,
    updateReservation,
    fetchReservations
  } = useReservations({
    autoFetch: false, // We'll handle fetching manually
  });

  // Fetch reservations when filters change
  useEffect(() => {
    fetchReservations({
      clientEmail: effectiveEmailFilter || undefined,
      status: (statusFilter || undefined) as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      pageSize,
      page: 1,
    });
  }, [effectiveEmailFilter, statusFilter, dateFrom, dateTo, pageSize, fetchReservations, userIsAdmin]);

  // Open cancel modal
  const handleCancelClick = useCallback((id: string) => {
    setSelectedReservationId(id);
    setCancelModalOpen(true);
  }, []);

  // Open delete modal
  const handleDeleteClick = useCallback((id: string) => {
    setSelectedReservationId(id);
    setDeleteModalOpen(true);
  }, []);

  // Confirm cancel
  const handleConfirmCancel = useCallback(async () => {
    if (!selectedReservationId) return;
    
    const success = await cancelReservation(selectedReservationId);
    if (success) {
      setCancelModalOpen(false);
      setSelectedReservationId(null);
      // Refetch with current filters
      fetchReservations({
        clientEmail: effectiveEmailFilter || undefined,
        status: (statusFilter || undefined) as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        pageSize,
      });
    }
  }, [cancelReservation, fetchReservations, effectiveEmailFilter, statusFilter, dateFrom, dateTo, pageSize, selectedReservationId]);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedReservationId) return;
    
    const success = await deleteReservation(selectedReservationId);
    if (success) {
      setDeleteModalOpen(false);
      setSelectedReservationId(null);
      // Refetch with current filters
      fetchReservations({
        clientEmail: effectiveEmailFilter || undefined,
        status: (statusFilter || undefined) as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        pageSize,
      });
    }
  }, [deleteReservation, fetchReservations, effectiveEmailFilter, statusFilter, dateFrom, dateTo, pageSize, selectedReservationId]);

  // Open edit modal
  const handleEditClick = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditModalOpen(true);
  }, []);

  // Handle update reservation
  const handleUpdateReservation = useCallback(async (id: string, data: UpdateReservationDto) => {
    const result = await updateReservation(id, data);
    return result;
  }, [updateReservation]);

  // Group reservations by date for better visualization
  const groupedReservations = useMemo(() => {
    const groups: Record<string, typeof reservations> = {};
    
    if (!reservations || reservations.length === 0) return groups;
    
    reservations.forEach((reservation) => {
      const dateKey = reservation.date.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(reservation);
    });
    
    return groups;
  }, [reservations]);

  const sortedDates = Object.keys(groupedReservations).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 font-display">
            {userIsAdmin ? 'All Reservations' : 'My Reservations'}
          </h1>
          <p className="text-surface-500 mt-1">
            {userIsAdmin 
              ? 'Manage and track all workspace bookings'
              : `Viewing reservations for ${currentUser.email}`
            }
          </p>
        </div>
        
        <Button
          size="lg"
          onClick={() => navigate('/reservations/new')}
        >
          <PlusIcon className="h-5 w-5" />
          New Reservation
        </Button>
      </div>

      {/* Filters Card */}
      <Card variant="default" padding="md">
        <ReservationFilters
          clientEmail={emailFilter}
          status={statusFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onEmailChange={setEmailFilter}
          onStatusChange={setStatusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          showEmailFilter={userIsAdmin}
        />
      </Card>

      {/* Stats Summary */}
      {pagination && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" padding="md">
            <p className="text-sm text-surface-500">Total</p>
            <p className="text-2xl font-bold text-surface-900">{pagination.totalItems}</p>
          </Card>
          <Card variant="glass" padding="md">
            <p className="text-sm text-surface-500">Current Page</p>
            <p className="text-2xl font-bold text-surface-900">
              {pagination.page} / {pagination.totalPages || 1}
            </p>
          </Card>
        </div>
      )}

      {/* Reservations List */}
      {isLoading ? (
        <div className="py-20">
          <Spinner size="lg" />
        </div>
      ) : !reservations || reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarDaysIcon className="h-16 w-16" />}
          title="No reservations found"
          description={
            userIsAdmin
              ? "No reservations match your filters."
              : "You haven't made any reservations yet."
          }
          action={
            <Button onClick={() => navigate('/reservations/new')}>
              <PlusIcon className="h-5 w-5" />
              Create Your First Reservation
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="grid gap-4">
                {groupedReservations[date].map((reservation, index) => (
                  <div
                    key={reservation.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ReservationCard
                      reservation={reservation}
                      onCancel={handleCancelClick}
                      onDelete={userIsAdmin ? handleDeleteClick : undefined}
                      onEdit={handleEditClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay for submitting */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Spinner size="lg" />
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-surface-100">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-surface-500">per page</span>
          </div>

          {/* Page navigation */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() => goToPage(pagination.page - 1)}
              >
                Previous
              </Button>
              
              <span className="px-4 py-2 text-sm text-surface-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedReservationId(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? The reservation status will be changed to cancelled."
        confirmLabel="Cancel Reservation"
        cancelLabel="Go Back"
        variant="warning"
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedReservationId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Reservation"
        message="Are you sure you want to permanently delete this reservation? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Go Back"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* Edit Reservation Modal */}
      <EditReservationModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReservation(null);
        }}
        onSubmit={handleUpdateReservation}
        reservation={selectedReservation}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
