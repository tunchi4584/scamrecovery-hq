
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreateCaseModal } from '@/components/CreateCaseModal';
import { 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, cases, balance, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <TrendingUp className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'resolved': 
      case 'complete': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': 
      case 'closed': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {profile?.name || user.email}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your recovery cases and track progress
              </p>
            </div>
            <CreateCaseModal />
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Lost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${balance?.amount_lost?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Recovered</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${balance?.amount_recovered?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {cases?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {cases && cases.length > 0 ? (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {caseItem.title}
                        </h3>
                        <Badge className={getStatusColor(caseItem.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(caseItem.status)}
                            {caseItem.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {caseItem.case_number && (
                          <p><span className="font-medium">Case #:</span> {caseItem.case_number}</p>
                        )}
                        <p><span className="font-medium">Amount:</span> ${caseItem.amount?.toLocaleString() || '0'}</p>
                        {caseItem.scam_type && (
                          <p><span className="font-medium">Type:</span> {caseItem.scam_type}</p>
                        )}
                        <p><span className="font-medium">Created:</span> {new Date(caseItem.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to case details when implemented
                        console.log('View case:', caseItem.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cases yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first recovery case to get started
                </p>
                <CreateCaseModal />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Notes */}
        {balance?.recovery_notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recovery Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{balance.recovery_notes}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
