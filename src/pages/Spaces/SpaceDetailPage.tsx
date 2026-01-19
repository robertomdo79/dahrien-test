import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UsersIcon, 
  MapPinIcon, 
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Spinner } from '@/components/ui';
import { useSpaces, useIoT } from '@/hooks';
import { TelemetryWidget } from '@/components/iot';
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

export function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { selectedSpace, fetchSpaceById, isLoading, clearSelectedSpace } = useSpaces({ autoFetch: false });
  const { getLatestForSpace, fetchLatestBySpace } = useIoT({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchSpaceById(id);
      fetchLatestBySpace(id);
    }
    
    return () => {
      clearSelectedSpace();
    };
  }, [id, fetchSpaceById, fetchLatestBySpace, clearSelectedSpace]);

  const telemetry = id ? getLatestForSpace(id) : null;

  // Get the image source
  const imageSrc = selectedSpace ? getSpaceImage(selectedSpace) : null;

  if (isLoading) {
    return (
      <div className="py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedSpace) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-surface-900">Space not found</h2>
        <p className="text-surface-500 mt-2">The space you're looking for doesn't exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Go back to spaces
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Spaces
      </Link>

      {/* Header */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden">
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={selectedSpace.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            <div className="absolute top-4 right-4">
              {selectedSpace.isActive ? (
                <Badge variant="success" className="flex items-center gap-1 text-sm">
                  <CheckCircleIcon className="h-4 w-4" />
                  Available
                </Badge>
              ) : (
                <Badge variant="danger" className="flex items-center gap-1 text-sm">
                  <XCircleIcon className="h-4 w-4" />
                  Unavailable
                </Badge>
              )}
            </div>

            {/* Space name overlay at bottom */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display drop-shadow-lg">
                {selectedSpace.name}
              </h1>
              {selectedSpace.place && (
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{selectedSpace.place.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Card */}
          <Card variant="elevated" padding="lg">
            <div className="space-y-6">
              {selectedSpace.description && (
                <p className="text-surface-600 text-lg leading-relaxed">
                  {selectedSpace.description}
                </p>
              )}

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-surface-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 mb-1">
                    <UsersIcon className="h-5 w-5" />
                    <span className="text-sm">Capacity</span>
                  </div>
                  <p className="text-2xl font-bold text-surface-900">
                    {selectedSpace.capacity}
                  </p>
                </div>

                {selectedSpace.reference && (
                  <div className="bg-surface-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-surface-500 mb-1">
                      <MapPinIcon className="h-5 w-5" />
                      <span className="text-sm">Reference</span>
                    </div>
                    <p className="text-lg font-semibold text-surface-900 font-mono">
                      {selectedSpace.reference}
                    </p>
                  </div>
                )}

                <div className="bg-surface-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 mb-1">
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-sm">Hours</span>
                  </div>
                  <p className="text-lg font-semibold text-surface-900">
                    8:00 - 20:00
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card variant="elevated" padding="lg" className="sticky top-28">
            <h3 className="text-lg font-semibold text-surface-900 font-display mb-4">
              Book This Space
            </h3>
            
            <p className="text-surface-500 mb-6">
              Reserve this workspace for your next meeting or work session.
            </p>

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedSpace.isActive}
              onClick={() => navigate(`/reservations/new?spaceId=${selectedSpace.id}`)}
            >
              <CalendarDaysIcon className="h-5 w-5" />
              {selectedSpace.isActive ? 'Make Reservation' : 'Not Available'}
            </Button>

            {!selectedSpace.isActive && (
              <p className="text-sm text-surface-500 mt-3 text-center">
                This space is currently unavailable for booking.
              </p>
            )}
          </Card>

          {/* IoT Telemetry */}
          {telemetry && (
            <TelemetryWidget telemetry={telemetry} title="Live Environment" />
          )}
        </div>
      </div>
    </div>
  );
}
