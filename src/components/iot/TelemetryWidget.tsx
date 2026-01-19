import { 
  BeakerIcon,
  UserGroupIcon,
  Battery50Icon,
  SunIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui';
import type { Telemetry } from '@/types';
import { formatDate } from '@/utils';

interface TelemetryWidgetProps {
  telemetry: Telemetry;
  title?: string;
  compact?: boolean;
}

export function TelemetryWidget({ telemetry, title = 'Environment', compact = false }: TelemetryWidgetProps) {
  const metrics = [
    {
      label: 'Temperature',
      value: telemetry.temperature !== null ? `${telemetry.temperature.toFixed(1)}°C` : '--',
      icon: SunIcon,
      status: getTemperatureStatus(telemetry.temperature),
    },
    {
      label: 'Humidity',
      value: telemetry.humidity !== null ? `${telemetry.humidity.toFixed(0)}%` : '--',
      icon: BeakerIcon,
      status: getHumidityStatus(telemetry.humidity),
    },
    {
      label: 'CO₂',
      value: telemetry.co2 !== null ? `${telemetry.co2.toFixed(0)}` : '--',
      unit: 'ppm',
      icon: BeakerIcon,
      status: getCO2Status(telemetry.co2),
    },
    {
      label: 'Occupancy',
      value: telemetry.peopleCount !== null ? telemetry.peopleCount.toString() : '--',
      icon: UserGroupIcon,
      status: 'neutral',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.label} className="flex items-center gap-1.5">
            <metric.icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
            <span className="text-surface-600">
              {metric.value}
              {metric.unit && <span className="text-surface-400 ml-0.5">{metric.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-surface-900 font-display">{title}</h3>
        {telemetry.battery !== null && (
          <div className="flex items-center gap-1.5 text-sm text-surface-500">
            <Battery50Icon className="h-4 w-4" />
            <span>{telemetry.battery.toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-surface-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <metric.icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
              <span className="text-xs text-surface-500">{metric.label}</span>
            </div>
            <p className="text-xl font-bold text-surface-900">
              {metric.value}
              {metric.unit && (
                <span className="text-sm font-normal text-surface-400 ml-1">{metric.unit}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-surface-400 mt-4">
        Last updated: {formatDate(telemetry.timestamp, 'MMM dd, HH:mm')}
      </p>
    </Card>
  );
}

function getTemperatureStatus(temp: number | null): string {
  if (temp === null) return 'neutral';
  if (temp >= 18 && temp <= 24) return 'good';
  if (temp >= 16 && temp <= 26) return 'warning';
  return 'critical';
}

function getHumidityStatus(humidity: number | null): string {
  if (humidity === null) return 'neutral';
  if (humidity >= 30 && humidity <= 60) return 'good';
  if (humidity >= 20 && humidity <= 70) return 'warning';
  return 'critical';
}

function getCO2Status(co2: number | null): string {
  if (co2 === null) return 'neutral';
  if (co2 < 800) return 'good';
  if (co2 < 1200) return 'warning';
  return 'critical';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'good':
      return 'text-emerald-500';
    case 'warning':
      return 'text-amber-500';
    case 'critical':
      return 'text-red-500';
    default:
      return 'text-surface-400';
  }
}
