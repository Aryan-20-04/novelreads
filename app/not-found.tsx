import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">Page Not Found</h2>
        </div>

        <p className="text-muted-foreground">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              Admin Panel
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>If you believe this is an error, please contact the administrator.</p>
        </div>
      </div>
    </div>
  )
}
