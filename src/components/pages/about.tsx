import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sparkles, MessageSquare, Code, Zap, Shield, Users } from "lucide-react";

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-muted-foreground">About SparkAI</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          SparkAI is your all-in-one platform for AI-powered assistance, bringing together multiple
          specialized AI assistants to help you with conversations, coding, and creative tasks.
        </p>
      </div>

      {/* Mission */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            We believe in making advanced AI technology accessible to everyone. Our mission is to
            provide powerful, user-friendly AI tools that enhance productivity, creativity, and
            learning for individuals and teams worldwide.
          </p>
        </CardContent>
      </Card>

      {/* AI Assistants */}
      <div className="space-y-4">
        <h2 className="text-muted-foreground">Our AI Assistants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Engage in natural conversations, get answers to your questions, and receive helpful
                information on any topic.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <Code className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Code Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get programming help, debug code, generate snippets, and learn new technologies with
                AI-powered coding assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Sparky</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Unlock your creativity with innovative ideas, creative writing assistance, and unique
                perspectives on challenges.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h2 className="text-muted-foreground">Why Choose SparkAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Get instant responses powered by advanced AI technology.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2">User-Friendly</h3>
                <p className="text-muted-foreground">
                  Intuitive interface designed for everyone to use easily.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2">Always Improving</h3>
                <p className="text-muted-foreground">
                  Constantly updated with new features and capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Version Info */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">SparkAI Version 1.0.0</p>
          <p className="text-muted-foreground mt-1">© 2025 SparkAI. All rights reserved.</p>
        </CardContent>
      </Card>
    </div>
  );
}
