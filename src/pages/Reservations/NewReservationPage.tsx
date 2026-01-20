import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Card, Button, Input, Select } from '@/components/ui';
import { useSpaces, usePlaces, useReservations } from '@/hooks';
import { getTodayDate, generateTimeSlots } from '@/utils';
import type { CreateReservationDto } from '@/types';

export function NewReservationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSpaceId = searchParams.get('spaceId');

  const { places, placesOptions } = usePlaces();
  const { spaces, fetchSpaces } = useSpaces({ autoFetch: false });
  const { createReservation, isSubmitting } = useReservations({ autoFetch: false });

  // Form state
  const [selectedPlace, setSelectedPlace] = useState('');
  const [formData, setFormData] = useState<CreateReservationDto>({
    spaceId: preselectedSpaceId || '',
    clientEmail: '',
    date: getTodayDate(),
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Generate time slots
  const timeSlots = generateTimeSlots(8, 20, 30);
  const timeOptions = timeSlots.map((slot) => ({ value: slot, label: slot }));

  // Fetch spaces when place changes
  useEffect(() => {
    if (selectedPlace) {
      fetchSpaces({ placeId: selectedPlace, isActive: true });
    }
  }, [selectedPlace, fetchSpaces]);

  // If preselected space, find its place and set it
  useEffect(() => {
    if (preselectedSpaceId && spaces && spaces.length > 0) {
      const space = spaces.find((s) => s.id === preselectedSpaceId);
      if (space) {
        setSelectedPlace(space.placeId);
      }
    }
  }, [preselectedSpaceId, spaces]);

  // Load initial spaces if we have preselected place from space
  useEffect(() => {
    if (preselectedSpaceId) {
      // Fetch all spaces initially to find the preselected one
      fetchSpaces({ isActive: true });
    }
  }, [preselectedSpaceId, fetchSpaces]);

  const spaceOptions = (spaces || [])
    .filter((s) => !selectedPlace || s.placeId === selectedPlace)
    .map((space) => ({
      value: space.id,
      label: `${space.name} (Capacity: ${space.capacity})`,
    }));

  const handleInputChange = (field: keyof CreateReservationDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user makes changes
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Clear submit error when user changes any field
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.spaceId) {
      newErrors.spaceId = 'Please select a space';
    }

    if (!formData.clientEmail) {
      newErrors.clientEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (formData.date < getTodayDate()) {
      newErrors.date = 'Cannot book for past dates';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const reservation = await createReservation(formData);
      if (reservation) {
        navigate('/reservations');
      } else {
        // If no reservation returned but no exception, there was an error
        setSubmitError('Unable to create reservation. The selected time slot may not be available.');
      }
    } catch {
      setSubmitError('Unable to create reservation. Please check your selection and try again.');
    }
  };

  const selectedSpaceDetails = spaces?.find((s) => s.id === formData.spaceId);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Back button */}
      <Link
        to="/reservations"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Reservations
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900 font-display">
          New Reservation
        </h1>
        <p className="text-surface-500 mt-2">
          Book a workspace for your meeting or work session
        </p>
      </div>

      {/* Form */}
      <Card variant="elevated" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Selection */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Select
              label="Location"
              options={[{ value: '', label: 'Select a location' }, ...placesOptions]}
              value={selectedPlace}
              onChange={(e) => {
                setSelectedPlace(e.target.value);
                setFormData((prev) => ({ ...prev, spaceId: '' }));
              }}
            />

            <Select
              label="Space"
              options={[{ value: '', label: 'Select a space' }, ...spaceOptions]}
              value={formData.spaceId}
              onChange={(e) => handleInputChange('spaceId', e.target.value)}
              error={errors.spaceId}
              disabled={!selectedPlace && !preselectedSpaceId}
            />
          </div>

          {/* Selected space preview */}
          {selectedSpaceDetails && (
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                  {selectedSpaceDetails.capacity}
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{selectedSpaceDetails.name}</p>
                  <p className="text-sm text-surface-500">
                    Capacity: {selectedSpaceDetails.capacity} people
                    {selectedSpaceDetails.reference && ` • ${selectedSpaceDetails.reference}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client Email */}
          <Input
            label="Your Email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            error={errors.clientEmail}
            helperText="We'll send the confirmation to this email"
          />

          {/* Date and Time */}
          <div className="grid sm:grid-cols-3 gap-6">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={errors.date}
              min={getTodayDate()}
              leftIcon={<CalendarDaysIcon className="h-5 w-5" />}
            />

            <Select
              label="Start Time"
              options={timeOptions}
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              error={errors.startTime}
            />

            <Select
              label="End Time"
              options={timeOptions}
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              error={errors.endTime}
            />
          </div>

          {/* Time summary */}
          {formData.startTime && formData.endTime && formData.endTime > formData.startTime && (
            <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 rounded-xl px-4 py-3">
              <ClockIcon className="h-5 w-5 text-primary-500" />
              <span>
                Duration: {calculateDuration(formData.startTime, formData.endTime)}
              </span>
            </div>
          )}

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

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Booking Policy</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Maximum 3 active reservations per week</li>
              <li>Reservations cannot overlap with existing bookings</li>
              <li>Cancel at least 24 hours before your reservation</li>
            </ul>
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Reservation Failed</p>
                <p className="text-sm text-red-600 mt-1">{submitError}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => navigate('/reservations')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <CalendarDaysIcon className="h-5 w-5" />
              Create Reservation
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function calculateDuration(startTime: string, endTime: string): string {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const duration = endMinutes - startMinutes;
  
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}h ${minutes}min`;
}
