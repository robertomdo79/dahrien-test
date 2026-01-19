import { Input, Select } from '@/components/ui';
import type { ReservationStatus } from '@/types';

interface ReservationFiltersProps {
  clientEmail: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  onEmailChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  showEmailFilter?: boolean;
}

export function ReservationFilters({
  clientEmail,
  status,
  dateFrom,
  dateTo,
  onEmailChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  showEmailFilter = true,
}: ReservationFiltersProps) {
  const statusOptions: { value: '' | ReservationStatus; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${showEmailFilter ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
      {showEmailFilter && (
        <Input
          label="Email"
          type="email"
          placeholder="Filter by email..."
          value={clientEmail}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      )}

      <Select
        label="Status"
        options={statusOptions}
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      />

      <Input
        label="From Date"
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
      />

      <Input
        label="To Date"
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
      />
    </div>
  );
}
