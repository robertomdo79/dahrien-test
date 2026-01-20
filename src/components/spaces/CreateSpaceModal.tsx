import { useState, useEffect } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Modal, Button, Input, Select } from '@/components/ui';
import { usePlaces } from '@/hooks';
import type { CreateSpaceDto } from '@/types';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSpaceDto) => Promise<unknown>;
  isSubmitting?: boolean;
}

const imageOptions = [
  { value: '', label: 'No image' },
  { value: '/assets/alpha.png', label: 'Meeting Room Alpha' },
  { value: '/assets/beta.png', label: 'Meeting Room Beta' },
  { value: '/assets/design.png', label: 'Design Studio' },
  { value: '/assets/pod.png', label: 'Focus Pod' },
  { value: '/assets/quiet.jpg', label: 'Quiet Zone' },
  { value: '/assets/workshop.png', label: 'Workshop' },
  { value: '/assets/workspace.png', label: 'Open Workspace' },
];

export function CreateSpaceModal({ isOpen, onClose, onSubmit, isSubmitting }: CreateSpaceModalProps) {
  const { placesOptions } = usePlaces();
  
  const [formData, setFormData] = useState<CreateSpaceDto & { image?: string }>({
    placeId: '',
    name: '',
    capacity: 1,
    reference: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        placeId: '',
        name: '',
        capacity: 1,
        reference: '',
        description: '',
        image: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.placeId) {
      newErrors.placeId = 'Please select a location';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await onSubmit(formData);
    if (result) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Space" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location */}
        <Select
          label="Location *"
          options={[{ value: '', label: 'Select a location' }, ...placesOptions]}
          value={formData.placeId}
          onChange={(e) => handleInputChange('placeId', e.target.value)}
          error={errors.placeId}
        />

        {/* Name */}
        <Input
          label="Space Name *"
          placeholder="e.g., Meeting Room Alpha"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          leftIcon={<BuildingOfficeIcon className="h-5 w-5" />}
        />

        {/* Capacity */}
        <Input
          label="Capacity *"
          type="number"
          min={1}
          placeholder="Number of people"
          value={formData.capacity.toString()}
          onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
          error={errors.capacity}
          helperText="Maximum number of people this space can accommodate"
        />

        {/* Reference */}
        <Input
          label="Reference (Optional)"
          placeholder="e.g., Building A, Floor 2, Room 201"
          value={formData.reference || ''}
          onChange={(e) => handleInputChange('reference', e.target.value)}
          helperText="Internal location reference for easy identification"
        />

        {/* Image */}
        <Select
          label="Image (Optional)"
          options={imageOptions}
          value={formData.image || ''}
          onChange={(e) => handleInputChange('image', e.target.value)}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Describe the space, amenities, equipment available..."
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
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
            Create Space
          </Button>
        </div>
      </form>
    </Modal>
  );
}
