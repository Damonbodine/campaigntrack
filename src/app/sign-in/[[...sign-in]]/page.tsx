import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">CampaignTrack</h1>
          <p className="text-muted-foreground mt-1 text-sm">Capital campaign management for nonprofits</p>
        </div>
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card border border-border shadow-lg rounded-xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
              formFieldInput: "bg-background border-border text-foreground placeholder:text-muted-foreground",
              formFieldLabel: "text-foreground font-medium",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />
      </div>
    </div>
  );
}
