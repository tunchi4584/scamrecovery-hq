
import { useState } from 'react';
import { UserCase } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  MessageSquare, 
  Activity,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye
} from 'lucide-react';

interface CaseDetailsModalProps {
  case_: UserCase;
  children: React.ReactNode;
}

export function CaseDetailsModal({ case_, children }: CaseDetailsModalProps) {
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

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'in_progress': return 40;
      case 'under_review': return 60;
      case 'approved': return 80;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'under_review': return <AlertCircle className="h-5 w-5 text-purple-600" />;
      case 'in_progress': return <Activity className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  // Mock timeline data - in real app, this would come from the database
  const timeline = [
    {
      date: case_.created_at,
      title: 'Case Submitted',
      description: 'Your case has been received and is being reviewed by our team.',
      status: 'completed'
    },
    {
      date: case_.created_at,
      title: 'Initial Review',
      description: 'Our experts are analyzing your case details and evidence.',
      status: case_.status === 'pending' ? 'pending' : 'completed'
    },
    {
      date: case_.updated_at,
      title: 'Investigation Started',
      description: 'We have begun the recovery process for your case.',
      status: ['in_progress', 'under_review', 'approved', 'complete'].includes(case_.status) ? 'completed' : 'pending'
    },
    {
      date: case_.updated_at,
      title: 'Recovery in Progress',
      description: 'We are actively working to recover your funds.',
      status: ['under_review', 'approved', 'complete'].includes(case_.status) ? 'completed' : 'pending'
    },
    {
      date: case_.updated_at,
      title: 'Case Resolution',
      description: 'Your case has been resolved successfully.',
      status: case_.status === 'complete' ? 'completed' : 'pending'
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Case Details: {case_.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Case Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold">${Number(case_.amount).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-lg font-semibold">{new Date(case_.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(case_.status)}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={`${getStatusColor(case_.status)} font-medium`}>
                      {getStatusLabel(case_.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{getProgressPercentage(case_.status)}%</span>
                </div>
                <Progress value={getProgressPercentage(case_.status)} className="h-2" />
                <p className="text-sm text-gray-600">
                  {case_.status === 'complete' ? 'Your case has been completed successfully!' :
                   case_.status === 'approved' ? 'Your case has been approved and is being finalized.' :
                   case_.status === 'under_review' ? 'Your case is currently under review by our specialists.' :
                   case_.status === 'in_progress' ? 'We are actively working on your case.' :
                   'Your case is in the initial review stage.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for detailed information */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Case Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Case Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          event.status === 'completed' ? 'bg-green-500' :
                          event.status === 'current' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Case ID</label>
                      <p className="text-sm bg-gray-50 p-2 rounded font-mono">{case_.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Updated</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{new Date(case_.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case Title</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{case_.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount Involved</label>
                    <p className="text-lg font-semibold text-green-600">${Number(case_.amount).toLocaleString()}</p>
                  </div>

                  {case_.submission_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submission Reference</label>
                      <p className="text-sm bg-gray-50 p-2 rounded font-mono">{case_.submission_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Case Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No documents uploaded yet</p>
                    <p className="text-sm text-gray-500">
                      Documents and evidence will appear here as they are added to your case.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Support */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Need Help?</h4>
                  <p className="text-sm text-blue-700">
                    Contact our support team if you have questions about your case.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
