import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MessageSquare, Code, Sparkles, TrendingUp, Zap, Shield, Globe } from "lucide-react";
import { useEffect } from "react";

interface HomePageProps {
  onNavigate: (page: "chat" | "code" | "sparky" | "explore") => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  // Set root theme on component mount
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'login-light', 'login-dark');
    // Use default root theme
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
          <img
            src="/src/components/icon/star-2-svgrepo-com.svg"
            alt="Star Icon"
            className="h-12 w-12 text-white"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <h1 className="text-muted-foreground">Welcome to SparkAI</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your all-in-one platform for AI-powered assistance. Choose from our specialized AI assistants
          to help you with conversations, coding, and creative tasks.
        </p>
      </div>

      {/* AI Assistants Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer" onClick={() => onNavigate("chat")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Chat Assistant</CardTitle>
            <CardDescription>
              General conversation and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get help with general questions, have conversations, and receive helpful information on any topic.
            </p>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Chatting
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer" onClick={() => onNavigate("code")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Code Assistant</CardTitle>
            <CardDescription>
              Programming help and code generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get assistance with coding problems, debug issues, and generate code snippets in any language.
            </p>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Coding
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer" onClick={() => onNavigate("explore")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Explore</CardTitle>
            <CardDescription>
              Discover trends and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Explore the latest trends, news, and research in your field with real-time web search capabilities.
            </p>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Exploring
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer" onClick={() => onNavigate("sparky")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Sparky</CardTitle>
            <CardDescription>
              Creative and innovative ideas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Unlock your creativity with AI-powered brainstorming, creative writing, and innovative solutions.
            </p>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Creative
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3>Advanced AI</h3>
          <p className="text-muted-foreground">
            Powered by cutting-edge AI technology for accurate and helpful responses.
          </p>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3>Lightning Fast</h3>
          <p className="text-muted-foreground">
            Get instant responses to your queries without any delays.
          </p>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h3>Secure & Private</h3>
          <p className="text-muted-foreground">
            Your conversations are private and secure with end-to-end protection.
          </p>
        </div>
      </div>
    </div>
  );
}
