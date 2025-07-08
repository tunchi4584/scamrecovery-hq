
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, FileText, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-gray-600">
              Here's an overview of your recovery cases and current status.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-600">Current Balance</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${user.balance.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-600">Active Cases</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {user.cases.filter(c => c.status !== 'Resolved').length}
                    </p>
                  </div>
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-600">Total Cases</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {user.cases.length}
                    </p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cases Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">Your Recovery Cases</CardTitle>
              <Button onClick={() => navigate('/contact')}>
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </CardHeader>
            <CardContent>
              {user.cases.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Submit your first case to start the recovery process.
                  </p>
                  <Button onClick={() => navigate('/contact')}>
                    Submit Your First Case
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {user.cases.map((case_) => (
                    <div key={case_.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {case_.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Submitted: {new Date(case_.submittedDate).toLocaleDateString()}</span>
                            <span>Amount: ${case_.amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(case_.status)}
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">
                            {case_.status === 'Resolved' ? '100%' : 
                             case_.status === 'In Progress' ? '65%' : '15%'}
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              case_.status === 'Resolved' ? 'bg-green-600 w-full' :
                              case_.status === 'In Progress' ? 'bg-blue-600 w-2/3' : 'bg-yellow-600 w-1/6'
                            }`}
                          />
                        </div>
                      </div>

                      {case_.status === 'Resolved' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">
                              Case Resolved - ${case_.amount.toLocaleString()} recovered and added to your balance!
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Our team is here to assist you throughout your recovery process.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => navigate('/contact')} className="w-full">
                    Contact Support
                  </Button>
                  <Button onClick={() => navigate('/blog')} variant="outline" className="w-full">
                    View Recovery Resources
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Keep your account secure with these recommended actions.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" disabled>
                    Change Password (Coming Soon)
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    Two-Factor Authentication (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
