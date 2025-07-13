
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useSubmissions } from '@/hooks/useSubmissions';
import { SubmissionTable } from '@/components/admin/SubmissionTable';
import { SubmissionFilters } from '@/components/admin/SubmissionFilters';

export default function AdminSubmissions() {
  const { user, isAdmin, loading: authLoading } = useAdminAuth();
  const { 
    submissions, 
    loading, 
    error, 
    fetchSubmissions, 
    updateSubmission, 
    deleteSubmission, 
    sendEmailNotification 
  } = useSubmissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scamTypeFilter, setScamTypeFilter] = useState<string>('all');

  const scamTypes = useMemo(() => {
    return [...new Set(submissions.map(sub => sub.scam_type))];
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = 
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.scam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      const matchesScamType = scamTypeFilter === 'all' || submission.scam_type === scamTypeFilter;
      
      return matchesSearch && matchesStatus && matchesScamType;
    });
  }, [submissions, searchTerm, statusFilter, scamTypeFilter]);

  if (authLoading) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Loading submissions...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Scam Submissions">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Submissions</h3>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Scam Submissions">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Submissions ({submissions.length})</CardTitle>
            <SubmissionFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              scamTypeFilter={scamTypeFilter}
              onScamTypeChange={setScamTypeFilter}
              scamTypes={scamTypes}
              onRefresh={fetchSubmissions}
            />
          </div>
        </CardHeader>
        <CardContent>
          <SubmissionTable
            submissions={filteredSubmissions}
            onUpdate={updateSubmission}
            onDelete={deleteSubmission}
            onSendEmail={sendEmailNotification}
          />
          
          {filteredSubmissions.length === 0 && submissions.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              No submissions found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
