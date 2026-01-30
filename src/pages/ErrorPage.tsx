import { AlertCircle } from "lucide-react"
import { Button } from "../components/ui"

export default function ErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center text-center p-6 bg-bg-base">
      <AlertCircle className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-2xl font-semibold text-text-primary mb-2">
        Something went wrong
      </h1>
      <p className="text-text-secondary mb-6 max-w-md">
        We encountered an unexpected error. Please try again.
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
