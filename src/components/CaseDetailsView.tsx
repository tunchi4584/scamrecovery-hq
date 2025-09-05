
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Search, FileText, Calendar, DollarSign } from 'lucide-react';

interface CaseDetailsViewProps {
  filter: 'all' | 'pending' | 'in_progress' | 'completed';
  onBack: () => void;
}

export function CaseDetailsView({ filter, onBack }: CaseDetailsViewProps) {
  const { cases } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredCases = () => {
    let filtered = cases;

    if (filter === 'pending') {
      filtered = cases.filter(case_ => case_.status === 'pending');
    } else if (filter === 'in_progress') {
      filtered = cases.filter(case_ => case_.status === 'in_progress');
    } else if (filter === 'completed') {
      filtered = cases.filter(case_ => ['complete', 'resolved'].includes(case_.status));
    }

    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.scam_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCases = getFilteredCases();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'complete':
      case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFilterTitle = () => {
    switch (filter) {
      case 'pending': return 'Pending Cases';
      case 'in_progress': return 'In Progress Cases';
      case 'completed': return 'Completed Cases';
      default: return 'All Cases';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{getFilterTitle()}</h2>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by case number, title, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : `No ${filter} cases at the moment.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCases.map((case_) => (
            <Card key={case_.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{case_.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="font-mono">
                        {case_.case_number || 'Generating...'}
                      </Badge>
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status.charAt(0).toUpperCase() + case_.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {case_.amount?.toLocaleString() || '0'}
                    </div>
                    {case_.amount_recovered > 0 && (
                      <div className="flex items-center gap-1 text-blue-600 font-medium text-sm mt-1">
                        <DollarSign className="h-3 w-3" />
                        {case_.amount_recovered.toLocaleString()} recovered
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {case_.scam_type && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Scam Type:</span>
                      <p className="text-sm">{case_.scam_type}</p>
                    </div>
                  )}
                  
                  {case_.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <p className="text-sm text-gray-700 mt-1">{case_.description}</p>
                    </div>
                  )}

                  {case_.evidence && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Evidence:</span>
                      <p className="text-sm text-gray-700 mt-1">{case_.evidence}</p>
                    </div>
                  )}

                  {case_.recovery_notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Recovery Notes:</span>
                      <p className="text-sm text-green-700 mt-1">{case_.recovery_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created: {new Date(case_.created_at).toLocaleDateString()}
                    </div>
                    {case_.updated_at !== case_.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Updated: {new Date(case_.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
