import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  title?: string;
  error?: string;
  className?: string;
}

export function ErrorAlert({
  title = "Error",
  error,
  className,
}: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert
      variant="destructive"
      className={cn(
        "bg-rose-500/10 border-rose-500/20 text-rose-400 backdrop-blur-sm",
        className,
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
