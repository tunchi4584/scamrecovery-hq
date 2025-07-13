
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, FileText, Mail, Clock } from 'lucide-react';

export default function AdminActivity() {
  const activities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'New user registered',
      user: 'john@example.com',
      timestamp: '2 minutes ago',
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'case_created',
      message: 'New case submitted',
      user: 'jane@example.com',
      timestamp: '5 minutes ago',
      icon: FileText,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      type: 'email_sent',
      message: 'Email notification sent',
      user: 'System',
      timestamp: '10 minutes ago',
      icon: Mail,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  return (
    <AdminLayout title="Activity Monitor">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-full ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.message}</span>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </span>
                    </div>
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
