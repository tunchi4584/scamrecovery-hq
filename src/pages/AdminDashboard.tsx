
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

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'New user registration',
      description: 'A new user has joined the platform',
      icon: Users,
      color: 'bg-blue-50',
      iconColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      action: () => navigate('/admin/activity')
    },
    {
      id: 2,
      type: 'case_update',
      message: 'Case status updated',
      description: 'A case has been marked as completed',
      icon: FileText,
      color: 'bg-green-50',
      iconColor: 'bg-green-100',
      textColor: 'text-green-600',
      action: () => navigate('/admin/activity')
    },
    {
      id: 3,
      type: 'email_notification',
      message: 'Email notification sent',
      description: 'Status update email sent to user',
      icon: Mail,
      color: 'bg-yellow-50',
      iconColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
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
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${activity.color}`}
                  onClick={activity.action}
                >
                  <div className={`p-2 rounded-full ${activity.iconColor}`}>
                    <activity.icon className={`h-4 w-4 ${activity.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
