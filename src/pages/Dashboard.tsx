
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserBalanceCard } from "@/components/UserBalanceCard";
import { CaseStatusUpdates } from "@/components/CaseStatusUpdates";
import { CaseDetailsModal } from "@/components/CaseDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';

import { 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Eye,
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, cases, balance, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<any>(null);

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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in_progress': return 'default';
      case 'under_review': return 'secondary';
      case 'resolved': 
      case 'complete': return 'default';
      case 'rejected': 
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {profile?.name || user.email}
          </h1>
          <p className="text-muted-foreground">
            Manage your recovery cases and track progress
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <UserBalanceCard />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total cases filed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cases?.filter(c => c.status === 'pending').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">File New Case</CardTitle>
              <Plus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <Link to="/file-case">
                <Button className="w-full" size="sm">
                  Report Scam
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">
                Start a new case report
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Cases</CardTitle>
              <CardDescription>
                Your recently filed cases and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!cases || cases.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No cases filed yet.
                  </p>
                  <Link to="/file-case">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      File Your First Case
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cases.slice(0, 5).map((case_) => (
                    <div
                      key={case_.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedCase(case_)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{case_.case_number}</span>
                          <Badge variant={getStatusVariant(case_.status)}>
                            {case_.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {case_.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${case_.amount.toLocaleString()} • {case_.scam_type}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {cases && cases.length > 0 && selectedCase ? (
            <CaseStatusUpdates
              caseId={selectedCase.id}
              caseNumber={selectedCase.case_number}
              status={selectedCase.status}
              amount={selectedCase.amount}
              createdAt={selectedCase.created_at}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common actions and helpful resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/file-case">
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    File a New Case
                  </Button>
                </Link>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    Need help with your case? Contact our support team for assistance.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Case Guidelines
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Get Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {selectedCase && (
          <CaseDetailsModal case_={selectedCase}>
            <div></div>
          </CaseDetailsModal>
        )}
      </div>
    </div>
  );
}
