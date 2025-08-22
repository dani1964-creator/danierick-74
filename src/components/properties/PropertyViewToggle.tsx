import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const PropertyViewToggle = ({ view, onViewChange }: PropertyViewToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={view === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PropertyViewToggle;