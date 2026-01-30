import { Spinner } from "../components/ui"

export default function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
      <Spinner size="lg" className="text-indigo-500" />
    </div>
  )
}
