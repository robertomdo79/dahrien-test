import { useState, useEffect } from 'react';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Modal, Button, Input } from '@/components/ui';
import type { Reservation, UpdateReservationDto } from '@/types';
import { formatDate} from '@/utils';

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateReservationDto) => Promise<unknown>;
  reservation: Reservation | null;
  isSubmitting?: boolean;
}

export function EditReservationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  reservation, 
  isSubmitting 
}: EditReservationModalProps) {
  const [formData, setFormData] = useState<UpdateReservationDto>({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when reservation changes
  useEffect(() => {
    if (isOpen && reservation) {
      setFormData({
        date: reservation.date.split('T')[0], // Get YYYY-MM-DD format
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        notes: reservation.notes || '',
      });
      setErrors({});
    }
  }, [isOpen, reservation]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !reservation) {
      return;
    }

    const result = await onSubmit(reservation.id, formData);
    if (result) {
      onClose();
    }
  };

  if (!reservation) return null;

  // Check if the reservation can be edited (not cancelled or completed)
  const canEdit = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Reservation" size="lg">
      <div className="space-y-6">
        {/* Reservation Info Header */}
        <div className="p-4 bg-surface-50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-surface-900">
              {reservation.space?.name || 'Space'}
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
              reservation.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
              reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              'bg-surface-200 text-surface-600'
            }`}>
              {reservation.status}
            </span>
          </div>
          {reservation.place && (
            <p className="text-sm text-surface-500">{reservation.place.name}</p>
          )}
          <p className="text-sm text-surface-500">{reservation.clientEmail}</p>
        </div>

        {!canEdit ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              This reservation cannot be edited because it has been {reservation.status.toLowerCase()}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <Input
              label="Date *"
              type="date"
              value={formData.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={errors.date}
              leftIcon={<CalendarDaysIcon className="h-5 w-5" />}
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time *"
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                error={errors.startTime}
                leftIcon={<ClockIcon className="h-5 w-5" />}
              />
              <Input
                label="End Time *"
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                error={errors.endTime}
                leftIcon={<ClockIcon className="h-5 w-5" />}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Any special requirements or notes..."
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-surface-300 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-surface-100">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {!canEdit && (
          <div className="flex justify-end pt-4 border-t border-surface-100">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
