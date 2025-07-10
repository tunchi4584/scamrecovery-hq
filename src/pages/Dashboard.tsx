
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Plus,
  TrendingUp,
  Shield,
  Star
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, cases, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const totalAmount = cases.reduce((sum, case_) => sum + Number(case_.amount), 0);
  const resolvedCases = cases.filter(case_ => case_.status === 'complete');
  const recoveredAmount = resolvedCases.reduce((sum, case_) => sum + Number(case_.amount), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'complete': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'complete': return 'Complete';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      <Header />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.name}! 🎉</h1>
                  <p className="text-blue-100 text-xl">Your recovery journey dashboard</p>
                </div>
                <Shield className="h-20 w-20 text-blue-200" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Cases</p>
                    <p className="text-3xl font-bold">{cases.length}</p>
                  </div>
                  <FileText className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Amount</p>
                    <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Recovered</p>
                    <p className="text-3xl font-bold">${recoveredAmount.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                    <p className="text-3xl font-bold">
                      {cases.length > 0 ? Math.round((resolvedCases.length / cases.length) * 100) : 0}%
                    </p>
                  </div>
                  <Star className="h-12 w-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="mb-8 text-center">
            <Button
              onClick={() => navigate('/contact')}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Submit New Recovery Case
            </Button>
          </div>

          {/* Cases Section */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-2xl text-gray-800 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Your Recovery Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No cases yet</h3>
                  <p className="text-gray-500 mb-6">Get started by submitting your first recovery case</p>
                  <Button
                    onClick={() => navigate('/contact')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Submit Your First Case
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cases.map((case_) => (
                    <div key={case_.id} className="bg-gradient-to-r from-white to-blue-50/50 border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{case_.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${Number(case_.amount).toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(case_.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(case_.status)} font-medium`}>
                          {getStatusLabel(case_.status)}
                        </Badge>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Case Progress</span>
                          <span className="text-sm text-gray-600">
                            {case_.status === 'complete' ? '100%' : 
                             case_.status === 'approved' ? '80%' :
                             case_.status === 'under_review' ? '60%' :
                             case_.status === 'in_progress' ? '40%' : '20%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              case_.status === 'complete' ? 'bg-gradient-to-r from-green-400 to-green-600 w-full' :
                              case_.status === 'approved' ? 'bg-gradient-to-r from-green-400 to-blue-600 w-4/5' :
                              case_.status === 'under_review' ? 'bg-gradient-to-r from-blue-400 to-purple-600 w-3/5' :
                              case_.status === 'in_progress' ? 'bg-gradient-to-r from-blue-400 to-blue-600 w-2/5' :
                              'bg-gradient-to-r from-yellow-400 to-yellow-600 w-1/5'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
