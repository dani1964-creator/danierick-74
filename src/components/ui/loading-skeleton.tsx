import { Skeleton } from "@/components/ui/skeleton";

export const PropertyCardSkeleton = () => (
  <div className="bg-card rounded-lg shadow-sm border overflow-hidden animate-fade-in">
    <Skeleton className="h-48 w-full shimmer" shimmer />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4 shimmer" shimmer />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
);

export const PropertiesGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
);

export const HeaderSkeleton = () => (
  <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/80 shadow-sm border-b animate-fade-in">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 sm:h-20">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-md shimmer" shimmer />
          <Skeleton className="h-6 w-40 sm:h-7 sm:w-48 shimmer" shimmer />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Skeleton className="h-9 w-24 sm:h-10 sm:w-28 rounded-md" />
          <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

export const PublicSiteSkeleton = () => (
  <div className="min-h-screen bg-background animate-fade-in">
    <HeaderSkeleton />
    
    {/* Hero Section Skeleton - Replicating HeroBanner structure */}
    <section className="relative h-[60vh] bg-muted animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Skeleton className="h-12 sm:h-16 md:h-20 w-80 sm:w-96 md:w-[600px] mx-auto shimmer" shimmer />
          <Skeleton className="h-6 sm:h-8 w-64 sm:w-80 md:w-96 mx-auto" />
        </div>
      </div>
    </section>
    
    {/* Search Filters Section Skeleton - Replicating SearchFilters structure */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-lg shadow-lg border p-4 sm:p-6">
        {/* Search bar and filters row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          {/* Search input skeleton */}
          <div className="flex-1 w-full sm:max-w-md">
            <Skeleton className="h-10 sm:h-11 w-full" />
          </div>
          
          {/* Filter dropdowns skeleton */}
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Skeleton className="h-10 sm:h-11 w-28 sm:w-32" />
            <Skeleton className="h-10 sm:h-11 w-32 sm:w-40" />
            <Skeleton className="h-10 sm:h-11 w-24 sm:w-28" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Properties Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="space-y-8">
        {/* Featured Properties Title */}
        <div className="text-center">
          <Skeleton className="h-8 sm:h-10 w-64 sm:w-80 mx-auto shimmer" shimmer />
          <Skeleton className="h-4 sm:h-5 w-48 sm:w-64 mx-auto mt-2" />
        </div>
        
        {/* Properties Grid */}
        <PropertiesGridSkeleton count={6} />
      </div>
    </div>
  </div>
);

export const ContentPageSkeleton = () => (
  <div className="min-h-screen bg-background animate-fade-in">
    {/* Header Skeleton */}
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-md shimmer" shimmer />
          <Skeleton className="h-6 w-40 sm:h-7 sm:w-48 shimmer" shimmer />
        </div>
      </div>
    </div>
    
    {/* Breadcrumbs Skeleton */}
    <div className="bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
    
    {/* Content Skeleton */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-card rounded-lg shadow-lg border p-6 sm:p-8 space-y-6">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 shimmer" shimmer />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === 7 ? 'w-2/3' : 'w-full'}`} 
            />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === 5 ? 'w-3/4' : 'w-full'}`} 
            />
          ))}
        </div>
      </div>
      
      {/* Back Button Skeleton */}
      <div className="mt-8 text-center">
        <Skeleton className="h-10 sm:h-12 w-32 sm:w-40 mx-auto rounded-md" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16 mt-2" />
          <Skeleton className="h-3 w-20 mt-1" />
        </div>
      ))}
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);