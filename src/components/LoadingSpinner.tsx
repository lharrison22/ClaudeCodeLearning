interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="sm" className="mr-2" />
      <span>Loading...</span>
    </div>
  );
}