import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  UserCircleIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Card, Badge } from '@/components/ui';
import type { Reservation, ReservationStatus } from '@/types';
import { formatDate, formatTime, formatRelativeDate } from '@/utils';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (reservation: Reservation) => void;
}

export function ReservationCard({ reservation, onCancel, onDelete, onEdit }: ReservationCardProps) {
  const statusConfig: Record<ReservationStatus, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
    CONFIRMED: { variant: 'success', label: 'Confirmed' },
    PENDING: { variant: 'warning', label: 'Pending' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    COMPLETED: { variant: 'default', label: 'Completed' },
  };

  const status = statusConfig[reservation.status];
  const canCancel = reservation.status === 'CONFIRMED' || reservation.status === 'PENDING';

  return (
    <Card variant="elevated" padding="none" className="overflow-visible">
      <div className="flex">
        {/* Date sidebar */}
        <div className="w-24 flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4 flex flex-col items-center justify-center rounded-l-2xl">
          <span className="text-3xl font-bold font-display">
            {formatDate(reservation.date, 'dd')}
          </span>
          <span className="text-sm opacity-80">
            {formatDate(reservation.date, 'MMM')}
          </span>
          <span className="text-xs opacity-60 mt-1">
            {formatDate(reservation.date, 'yyyy')}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900 font-display">
                  {reservation.space?.name || 'Unknown Space'}
                </h3>
                <Badge variant={status.variant} size="sm">
                  {status.label}
                </Badge>
              </div>

              {reservation.place && (
                <div className="flex items-center gap-1.5 text-sm text-surface-500">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{reservation.place.name}</span>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <Menu as="div" className="relative">
              <MenuButton className="p-1 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </MenuButton>
              <MenuItems className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-surface-100 py-1 z-50 focus:outline-none">
                {onEdit && (
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => onEdit(reservation)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-surface-50 text-surface-900' : 'text-surface-600'
                        }`}
                      >
                        Edit
                      </button>
                    )}
                  </MenuItem>
                )}
                {canCancel && onCancel && (
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => onCancel(reservation.id)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-amber-50 text-amber-600' : 'text-amber-500'
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                  </MenuItem>
                )}
                {onDelete && (
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={() => onDelete(reservation.id)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-red-50 text-red-600' : 'text-red-500'
                        }`}
                      >
                        Delete
                      </button>
                    )}
                  </MenuItem>
                )}
              </MenuItems>
            </Menu>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-surface-600">
              <CalendarDaysIcon className="h-4 w-4 text-primary-500" />
              <span>{formatRelativeDate(reservation.date)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-surface-600">
              <ClockIcon className="h-4 w-4 text-primary-500" />
              <span>
                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-surface-600">
              <UserCircleIcon className="h-4 w-4 text-primary-500" />
              <span className="truncate max-w-[200px]">{reservation.clientEmail}</span>
            </div>
          </div>

          {reservation.notes && (
            <p className="mt-3 text-sm text-surface-500 bg-surface-50 rounded-lg px-3 py-2">
              {reservation.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
