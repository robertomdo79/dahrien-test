import { useEffect, useState, useCallback } from 'react';
import { 
  ChartBarIcon, 
  ArrowPathIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Select, Spinner, EmptyState, Badge } from '@/components/ui';
import { TelemetryWidget } from '@/components/iot';
import { usePlaces, useSpaces, useIoT } from '@/hooks';
import { telemetryService } from '@/services';
import type { GeneratorStatus } from '@/services/telemetry';
import { cn } from '@/utils';
import toast from 'react-hot-toast';

export function IoTDashboardPage() {
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [generatorStatus, setGeneratorStatus] = useState<GeneratorStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { places, placesOptions, isLoading: placesLoading } = usePlaces();
  const { spaces, fetchSpaces, isLoading: spacesLoading } = useSpaces({ autoFetch: false });
  const { 
    latestBySpace, 
    fetchLatestByPlace, 
    isLoading: telemetryLoading,
    getSensorStatus,
  } = useIoT({ placeId: selectedPlaceId, autoFetch: false });

  // Fetch generator status on mount
  useEffect(() => {
    telemetryService.getGeneratorStatus()
      .then(setGeneratorStatus)
      .catch(console.error);
  }, []);

  // Fetch spaces and telemetry when place changes
  useEffect(() => {
    if (selectedPlaceId) {
      fetchSpaces({ placeId: selectedPlaceId, isActive: true });
      fetchLatestByPlace(selectedPlaceId);
    }
  }, [selectedPlaceId, fetchSpaces, fetchLatestByPlace]);

  // Auto-select first place if available
  useEffect(() => {
    if (places && places.length > 0 && !selectedPlaceId) {
      setSelectedPlaceId(places[0].id);
    }
  }, [places, selectedPlaceId]);

  // Generate telemetry manually
  const handleGenerateTelemetry = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await telemetryService.generateTelemetry();
      toast.success(`Generated telemetry for ${result.spacesUpdated} spaces`);
      
      // Refresh the data
      if (selectedPlaceId) {
        fetchLatestByPlace(selectedPlaceId);
      }
    } catch (error) {
      toast.error('Failed to generate telemetry');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPlaceId, fetchLatestByPlace]);

  // Toggle generator
  const handleToggleGenerator = useCallback(async () => {
    try {
      if (generatorStatus?.isRunning) {
        const status = await telemetryService.stopGenerator();
        setGeneratorStatus(status);
        toast.success('Telemetry generator stopped');
      } else {
        const status = await telemetryService.startGenerator();
        setGeneratorStatus(status);
        toast.success('Telemetry generator started');
        
        // Refresh data after a short delay to show new data
        setTimeout(() => {
          if (selectedPlaceId) {
            fetchLatestByPlace(selectedPlaceId);
          }
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to toggle generator');
      console.error(error);
    }
  }, [generatorStatus, selectedPlaceId, fetchLatestByPlace]);

  const isLoading = placesLoading || spacesLoading || telemetryLoading;

  // Calculate overall stats
  const spaceStats = (spaces || []).map((space) => {
    const telemetry = latestBySpace.get(space.id);
    const status = getSensorStatus(telemetry || null);
    return { space, telemetry, status };
  });

  const statusCounts = {
    good: spaceStats.filter((s) => s.status === 'good').length,
    warning: spaceStats.filter((s) => s.status === 'warning').length,
    critical: spaceStats.filter((s) => s.status === 'critical').length,
    unknown: spaceStats.filter((s) => s.status === 'unknown').length,
  };

  const selectedPlace = places?.find((p) => p.id === selectedPlaceId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900 font-display flex items-center gap-3">
          <ChartBarIcon className="h-8 w-8 text-primary-500" />
          IoT Dashboard
        </h1>
        <p className="text-surface-500 mt-1">
          Real-time environmental monitoring for all spaces
        </p>
      </div>

      {/* Generator Controls Card */}
      <Card variant="elevated" padding="md" className="bg-gradient-to-r from-surface-50 to-primary-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <BoltIcon className="h-5 w-5 text-amber-500" />
              Telemetry Generator
            </h3>
            <p className="text-sm text-surface-500 mt-1">
              {generatorStatus 
                ? generatorStatus.isRunning 
                  ? `Auto-generating data every ${generatorStatus.intervalMinutes} minutes`
                  : 'Generator is stopped - data will not auto-update'
                : 'Loading status...'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Generator Status Badge */}
            <Badge 
              variant={generatorStatus?.isRunning ? 'success' : 'default'}
              size="md"
            >
              {generatorStatus?.isRunning ? 'Running' : 'Stopped'}
            </Badge>

            {/* Generate Now Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTelemetry}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BoltIcon className="h-4 w-4" />
                  Generate Now
                </>
              )}
            </Button>

            {/* Start/Stop Button */}
            <Button
              variant={generatorStatus?.isRunning ? 'danger' : 'primary'}
              size="sm"
              onClick={handleToggleGenerator}
            >
              {generatorStatus?.isRunning ? (
                <>
                  <StopIcon className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Place Selector */}
      <Card variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 max-w-xs">
            <Select
              label="Select Location"
              options={[{ value: '', label: 'Choose a location' }, ...placesOptions]}
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
            />
          </div>

          {selectedPlace && (
            <div className="text-sm text-surface-500">
              Monitoring <span className="font-semibold text-surface-700">{spaces?.length || 0}</span> spaces at{' '}
              <span className="font-semibold text-surface-700">{selectedPlace.name}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Overview */}
      {selectedPlaceId && spaces && spaces.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" padding="md" className="border-l-4 border-l-emerald-500">
            <p className="text-sm text-surface-500">Optimal</p>
            <p className="text-3xl font-bold text-emerald-600">{statusCounts.good}</p>
          </Card>
          <Card variant="glass" padding="md" className="border-l-4 border-l-amber-500">
            <p className="text-sm text-surface-500">Warning</p>
            <p className="text-3xl font-bold text-amber-600">{statusCounts.warning}</p>
          </Card>
          <Card variant="glass" padding="md" className="border-l-4 border-l-red-500">
            <p className="text-sm text-surface-500">Critical</p>
            <p className="text-3xl font-bold text-red-600">{statusCounts.critical}</p>
          </Card>
          <Card variant="glass" padding="md" className="border-l-4 border-l-surface-300">
            <p className="text-sm text-surface-500">No Data</p>
            <p className="text-3xl font-bold text-surface-400">{statusCounts.unknown}</p>
          </Card>
        </div>
      )}

      {/* Spaces Grid */}
      {isLoading && (!spaces || !spaces.length) ? (
        <div className="py-20">
          <Spinner size="lg" />
        </div>
      ) : !selectedPlaceId ? (
        <EmptyState
          icon={<ChartBarIcon className="h-16 w-16" />}
          title="Select a Location"
          description="Choose a location from the dropdown above to view IoT sensor data for its spaces."
        />
      ) : !spaces || spaces.length === 0 ? (
        <EmptyState
          icon={<ExclamationTriangleIcon className="h-16 w-16" />}
          title="No Spaces Found"
          description="This location doesn't have any active spaces with IoT sensors."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaceStats.map(({ space, telemetry, status }, index) => (
            <div
              key={space.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card 
                variant="elevated" 
                padding="none"
                className={cn(
                  'overflow-hidden',
                  status === 'critical' && 'ring-2 ring-red-500/20'
                )}
              >
                {/* Header */}
                <div className="p-4 border-b border-surface-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900 font-display">
                      {space.name}
                    </h3>
                    {space.reference && (
                      <p className="text-xs text-surface-400 font-mono">{space.reference}</p>
                    )}
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Telemetry Data */}
                <div className="p-4">
                  {telemetry ? (
                    <TelemetryWidget telemetry={telemetry} compact={false} />
                  ) : (
                    <div className="text-center py-8 text-surface-400">
                      <SignalIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No sensor data available</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
    good: { variant: 'success', label: 'Optimal' },
    warning: { variant: 'warning', label: 'Warning' },
    critical: { variant: 'danger', label: 'Critical' },
    unknown: { variant: 'default', label: 'No Data' },
  };

  const { variant, label } = config[status] || config.unknown;

  return <Badge variant={variant} size="sm">{label}</Badge>;
}
