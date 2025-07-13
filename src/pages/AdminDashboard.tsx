
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  FileText, 
  DollarSign,
  Shield,
  Activity,
  Search,
  Mail
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      action: () => navigate('/admin/user-accounts')
    },
    {
      title: 'User Balances',
      description: 'View and update user balances',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      action: () => navigate('/admin/balances')
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'bg-gray-100 text-gray-600',
      action: () => navigate('/admin/settings')
    },
    {
      title: 'Activity Monitor',
      description: 'Monitor system activity',
      icon: Activity,
      color: 'bg-purple-100 text-purple-600',
      action: () => navigate('/admin/activity')
    }
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Dashboard Statistics */}
        <AdminDashboardStats />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start text-left hover:shadow-md transition-shadow"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg mb-2 ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-gray-600">A new user has joined the platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Case status updated</p>
                  <p className="text-xs text-gray-600">A case has been marked as completed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Mail className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email notification sent</p>
                  <p className="text-xs text-gray-600">Status update email sent to user</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
