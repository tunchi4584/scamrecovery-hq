import { FileCaseForm } from "@/components/FileCaseForm";

export default function FileCase() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">File a New Case</h1>
          <p className="text-muted-foreground">
            Report fraudulent activity and begin the recovery process
          </p>
        </div>
        
        <FileCaseForm />
      </div>
    </div>
  );
}