import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Squares2X2Icon, PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { SpaceCard, SpaceFilters, CreateSpaceModal, EditSpaceModal } from '@/components/spaces';
import { Button, Spinner, EmptyState } from '@/components/ui';
import { useSpaces } from '@/hooks';
import { useUserStore, isAdmin } from '@/context';
import type { Space, CreateSpaceDto, UpdateSpaceDto } from '@/types';

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const userIsAdmin = isAdmin(currentUser);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [placeFilter, setPlaceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  const { spaces, isLoading, isSubmitting, pagination, goToPage, fetchSpaces, createSpace, updateSpace, deleteSpace } = useSpaces({
    autoFetch: false, // We'll handle fetching manually
  });

  const handleCreateSpace = async (data: CreateSpaceDto) => {
    const result = await createSpace(data);
    return result;
  };

  const handleUpdateSpace = async (id: string, data: UpdateSpaceDto) => {
    const result = await updateSpace(id, data);
    return result;
  };

  const handleDeleteSpace = async (id: string) => {
    return await deleteSpace(id);
  };

  const handleEditClick = (space: Space) => {
    setSelectedSpace(space);
    setIsEditModalOpen(true);
  };

  // Fetch spaces when filters change
  useEffect(() => {
    fetchSpaces({
      placeId: placeFilter || undefined,
      isActive: statusFilter ? statusFilter === 'true' : undefined,
      pageSize: 12,
      page: 1,
    });
  }, [placeFilter, statusFilter, fetchSpaces]);

  // Client-side search filtering
  const filteredSpaces = useMemo(() => {
    if (!spaces || spaces.length === 0) return [];
    if (!searchQuery.trim()) return spaces;
    
    const query = searchQuery.toLowerCase();
    return spaces.filter(
      (space) =>
        space.name.toLowerCase().includes(query) ||
        space.description?.toLowerCase().includes(query) ||
        space.reference?.toLowerCase().includes(query)
    );
  }, [spaces, searchQuery]);

  const handleBookClick = (space: Space) => {
    navigate(`/reservations/new?spaceId=${space.id}`);
  };

  const handlePlaceChange = (value: string) => {
    setPlaceFilter(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-4">
            Find Your Perfect Workspace
          </h1>
          <p className="text-lg text-white/80 mb-6">
            Browse and book premium coworking spaces tailored to your needs. 
            From quiet focus areas to collaborative meeting rooms.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/reservations/new')}
            >
              <PlusIcon className="h-5 w-5" />
              Quick Reservation
            </Button>
            {userIsAdmin && (
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                Create Space
              </Button>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute right-20 top-0 w-32 h-32 bg-accent-400/20 rounded-full blur-2xl" />
      </section>

      {/* Filters */}
      <section>
        <SpaceFilters
          placeId={placeFilter}
          isActive={statusFilter}
          searchQuery={searchQuery}
          onPlaceChange={handlePlaceChange}
          onStatusChange={handleStatusChange}
          onSearchChange={setSearchQuery}
        />
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 font-display">
            Available Spaces
          </h2>
          {pagination && (
            <p className="text-surface-500 mt-1">
              Showing {filteredSpaces.length} of {pagination.totalItems} spaces
            </p>
          )}
        </div>
      </div>

      {/* Spaces Grid */}
      {isLoading ? (
        <div className="py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredSpaces.length === 0 ? (
        <EmptyState
          icon={<Squares2X2Icon className="h-16 w-16" />}
          title="No spaces found"
          description="Try adjusting your filters or search query to find available spaces."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space, index) => (
            <div
              key={space.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SpaceCard 
                space={space} 
                onBookClick={handleBookClick} 
                onEditClick={userIsAdmin ? handleEditClick : undefined}
                isAdmin={userIsAdmin}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="ghost"
            disabled={!pagination.hasPreviousPage}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                  page === pagination.page
                    ? 'bg-primary-500 text-white'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            disabled={!pagination.hasNextPage}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Space Modal (Admin Only) */}
      {userIsAdmin && (
        <CreateSpaceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSpace}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Edit Space Modal (Admin Only) */}
      {userIsAdmin && (
        <EditSpaceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSpace(null);
          }}
          onSubmit={handleUpdateSpace}
          onDelete={handleDeleteSpace}
          space={selectedSpace}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
