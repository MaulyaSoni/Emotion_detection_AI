import { Shield, Lock, Cpu } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Secure Analysis</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
              <Cpu className="h-3.5 w-3.5 text-accent" />
              <span>AI Powered</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Emotion predictions are probabilistic and may vary. Results should not be used for clinical or diagnostic
            purposes.
          </p>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-px holographic" />
    </footer>
  )
}
