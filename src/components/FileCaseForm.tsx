import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, DollarSign, AlertTriangle } from "lucide-react";

const caseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  scam_type: z.string().min(1, "Please select a scam type"),
  amount: z.string().min(1, "Amount is required").transform(val => parseFloat(val)),
  description: z.string().min(20, "Description must be at least 20 characters"),
  evidence: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseSchema>;

const scamTypes = [
  "Investment Fraud",
  "Romance Scam",
  "Phishing",
  "Identity Theft",
  "Online Shopping Fraud",
  "Tech Support Scam",
  "Crypto Scam",
  "Wire Fraud",
  "Credit Card Fraud",
  "Other"
];

export function FileCaseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: "",
      scam_type: "",
      amount: 0,
      description: "",
      evidence: "",
    },
  });

  const onSubmit = async (data: CaseFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to file a case",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.rpc('create_case_atomic', {
        p_user_id: user.id,
        p_title: data.title,
        p_description: data.description,
        p_scam_type: data.scam_type,
        p_amount: data.amount
      });

      if (error) {
        console.error('Error creating case:', error);
        toast({
          title: "Error filing case",
          description: error.message || "Failed to file case. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (result && result[0]) {
        const caseResult = result[0];
        if (caseResult.success) {
          toast({
            title: "Case filed successfully",
            description: `Your case ${caseResult.case_number} has been submitted for review.`,
          });
          form.reset();
        } else {
          toast({
            title: "Error filing case",
            description: caseResult.error_message || "Failed to file case",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File a New Case
        </CardTitle>
        <CardDescription>
          Report a scam or fraudulent activity. Provide as much detail as possible to help us assist you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of the incident" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A short, descriptive title for your case
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scam_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Scam</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of scam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scamTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the category that best describes the scam
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount Lost (USD)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Total amount lost in this incident
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of what happened, including dates, times, and any relevant information..."
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include as much detail as possible: timeline, how you were contacted, what information was requested, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence & Supporting Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List any evidence you have: emails, phone numbers, website URLs, bank statements, screenshots, etc."
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional evidence or information that might help with your case
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div className="text-sm">
                <p className="font-medium">Important:</p>
                <p className="text-muted-foreground">
                  Your case will be reviewed by our team. We may contact you for additional information.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Filing Case...
                </>
              ) : (
                "File Case"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}