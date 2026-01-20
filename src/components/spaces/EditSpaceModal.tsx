import { useState, useEffect } from 'react';
import { BuildingOfficeIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal, Button, Input, Select } from '@/components/ui';
import type { Space, UpdateSpaceDto } from '@/types';

interface EditSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateSpaceDto) => Promise<unknown>;
  onDelete: (id: string) => Promise<boolean>;
  space: Space | null;
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

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export function EditSpaceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete, 
  space, 
  isSubmitting 
}: EditSpaceModalProps) {
  const [formData, setFormData] = useState<UpdateSpaceDto & { image?: string }>({
    name: '',
    capacity: 1,
    reference: '',
    description: '',
    isActive: true,
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when space changes
  useEffect(() => {
    if (isOpen && space) {
      setFormData({
        name: space.name,
        capacity: space.capacity,
        reference: space.reference || '',
        description: space.description || '',
        isActive: space.isActive,
        image: space.image || '',
      });
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [isOpen, space]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
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

    if (!validateForm() || !space) {
      return;
    }

    const result = await onSubmit(space.id, formData);
    if (result) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!space) return;
    
    const success = await onDelete(space.id);
    if (success) {
      onClose();
    }
  };

  if (!space) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Space" size="lg">
      {showDeleteConfirm ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Delete Space</h3>
              <p className="mt-1 text-sm text-red-700">
                Are you sure you want to delete <strong>{space.name}</strong>? This action cannot be undone 
                and will remove all associated reservations.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <TrashIcon className="h-4 w-4" />
              Delete Space
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Input
            label="Space Name *"
            placeholder="e.g., Meeting Room Alpha"
            value={formData.name || ''}
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
            value={formData.capacity?.toString() || '1'}
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

          {/* Status */}
          <Select
            label="Status"
            options={statusOptions}
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
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
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
