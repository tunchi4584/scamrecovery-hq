import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, DollarSign, FileText, User } from "lucide-react";
import { format } from "date-fns";

interface CaseUpdate {
  id: string;
  timestamp: string;
  message: string;
  status?: string;
  updatedBy?: string;
}

interface CaseStatusUpdatesProps {
  caseId: string;
  caseNumber: string;
  status: string;
  amount: number;
  createdAt: string;
  updates?: CaseUpdate[];
}

const statusColors = {
  pending: "bg-yellow-500",
  in_progress: "bg-blue-500", 
  under_review: "bg-purple-500",
  resolved: "bg-green-500",
  complete: "bg-green-600",
  closed: "bg-gray-500"
};

const statusLabels = {
  pending: "Pending Review",
  in_progress: "In Progress",
  under_review: "Under Review", 
  resolved: "Resolved",
  complete: "Complete",
  closed: "Closed"
};

export function CaseStatusUpdates({ 
  caseId, 
  caseNumber, 
  status, 
  amount, 
  createdAt, 
  updates = [] 
}: CaseStatusUpdatesProps) {
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>(updates);

  // Mock updates for demonstration - in real app this would come from database
  useEffect(() => {
    const mockUpdates: CaseUpdate[] = [
      {
        id: "1",
        timestamp: createdAt,
        message: "Case has been received and is pending initial review.",
        status: "pending"
      },
      ...(status !== "pending" ? [{
        id: "2", 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        message: "Case has been assigned to our investigation team for detailed review.",
        status: "in_progress",
        updatedBy: "Admin Team"
      }] : []),
      ...(["under_review", "resolved", "complete"].includes(status) ? [{
        id: "3",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), 
        message: "Additional documentation has been requested from relevant parties.",
        status: "under_review",
        updatedBy: "Investigation Team"
      }] : []),
      ...(["resolved", "complete"].includes(status) ? [{
        id: "4",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        message: "Case investigation has been completed. Recovery process initiated.",
        status: "resolved", 
        updatedBy: "Recovery Team"
      }] : [])
    ];

    setCaseUpdates(mockUpdates);
  }, [status, createdAt]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Case Updates
        </CardTitle>
        <CardDescription>
          Track the progress of case {caseNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
              {statusLabels[status as keyof typeof statusLabels] || status}
            </Badge>
            <span className="text-sm text-muted-foreground">Current Status</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">${amount.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-3">Timeline</h4>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {caseUpdates.map((update, index) => (
                <div key={update.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      update.status ? statusColors[update.status as keyof typeof statusColors] : 'bg-gray-300'
                    }`} />
                    {index < caseUpdates.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(update.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                      {update.updatedBy && (
                        <>
                          <span>•</span>
                          <User className="h-3 w-3" />
                          {update.updatedBy}
                        </>
                      )}
                    </div>
                    <p className="text-sm">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}