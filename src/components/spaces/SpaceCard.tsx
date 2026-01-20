import { Link } from 'react-router-dom';
import { UsersIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Card, Badge } from '@/components/ui';
import type { Space } from '@/types';

// Import all space images
import alphaImg from '@/assets/alpha.png';
import betaImg from '@/assets/beta.png';
import designImg from '@/assets/design.png';
import podImg from '@/assets/pod.png';
import quietImg from '@/assets/quiet.jpg';
import workshopImg from '@/assets/workshop.png';
import workspaceImg from '@/assets/workspace.png';

// Map space names to images (fallback approach)
const getSpaceImage = (space: Space): string | null => {
  // First try to match by database image path
  const imagePathMap: Record<string, string> = {
    '/assets/alpha.png': alphaImg,
    '/assets/beta.png': betaImg,
    '/assets/design.png': designImg,
    '/assets/pod.png': podImg,
    '/assets/quiet.jpg': quietImg,
    '/assets/workshop.png': workshopImg,
    '/assets/workspace.png': workspaceImg,
  };

  if (space.image && imagePathMap[space.image]) {
    return imagePathMap[space.image];
  }

  // Fallback: match by space name
  const nameMap: Record<string, string> = {
    'Meeting Room Alpha': alphaImg,
    'Meeting Room Beta': betaImg,
    'Design Studio': designImg,
    'Focus Pod A': podImg,
    'Quiet Zone': quietImg,
    'Workshop Room': workshopImg,
    'Open Workspace': workspaceImg,
  };

  return nameMap[space.name] || null;
};

interface SpaceCardProps {
  space: Space;
  onBookClick?: (space: Space) => void;
  onEditClick?: (space: Space) => void;
  isAdmin?: boolean;
}

export function SpaceCard({ space, onBookClick, onEditClick, isAdmin }: SpaceCardProps) {
  const imageSrc = getSpaceImage(space);

  return (
    <Card 
      variant="elevated" 
      padding="none" 
      hoverable
      className="overflow-hidden group"
    >
      {/* Image section */}
      <div className="relative h-40 overflow-hidden">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={space.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {space.isActive ? (
            <Badge variant="success" size="sm" className="flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Available
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" className="flex items-center gap-1">
              <XCircleIcon className="h-3.5 w-3.5" />
              Unavailable
            </Badge>
          )}
        </div>

        {/* Floating capacity indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-medium text-surface-700">
          <UsersIcon className="h-4 w-4 text-primary-600" />
          <span>{space.capacity}</span>
        </div>

        {/* Admin edit button */}
        {isAdmin && onEditClick && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditClick(space);
            }}
            className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg text-surface-600 hover:text-primary-600 hover:bg-white transition-all shadow-sm"
            title="Edit space"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Title & Place */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-surface-900 font-display group-hover:text-primary-600 transition-colors">
            {space.name}
          </h3>
          {space.place && (
            <div className="flex items-center gap-1 text-sm text-surface-500 mt-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{space.place.name}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {space.description && (
          <p className="text-sm text-surface-600 line-clamp-2 mb-4">
            {space.description}
          </p>
        )}

        {/* Reference */}
        {space.reference && (
          <div className="text-xs text-surface-400 mb-4 font-mono">
            Ref: {space.reference}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/spaces/${space.id}`}
            className="flex-1 text-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
          >
            View Details
          </Link>
          {space.isActive && onBookClick && (
            <button
              onClick={() => onBookClick(space)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
