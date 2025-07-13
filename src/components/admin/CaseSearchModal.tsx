
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, DollarSign, Calendar, User } from 'lucide-react';

interface CaseResult {
  id: string;
  case_number: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  };
}

export function CaseSearchModal() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          case_number,
          title,
          amount,
          status,
          created_at,
          user_id,
          profiles!inner(name, email)
        `)
        .or(`case_number.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching cases:', error);
      toast({
        title: "Error",
        description: "Failed to search cases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-emerald-100 text-emerald-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Cases
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Cases by ID or Title
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter case number or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto">
          {searchResults.length === 0 && searchTerm && !loading ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No cases found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((case_) => (
                <div key={case_.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{case_.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono">
                          {case_.case_number}
                        </Badge>
                        <Badge className={getStatusColor(case_.status)}>
                          {case_.status.charAt(0).toUpperCase() + case_.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-lg">
                        <DollarSign className="h-4 w-4" />
                        {case_.amount?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{case_.profiles.name}</span>
                      <span className="text-gray-500">({case_.profiles.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Created: {new Date(case_.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
