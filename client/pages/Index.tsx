import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Code,
  Zap,
  Users,
  Palette,
  Download,
  PlayCircle,
  Star,
  ArrowRight,
  Github,
  Twitter,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gradient-from to-gradient-to rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                AppForge
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="text-sm hover:text-primary transition-colors"
              >
                Docs
              </a>
              <a
                href="#community"
                className="text-sm hover:text-primary transition-colors"
              >
                Community
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-gradient-from to-gradient-to hover:from-gradient-via hover:to-gradient-from"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gradient-from/20 via-gradient-via/20 to-gradient-to/20 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="w-3 h-3 mr-1" />
            Now supporting Android 14 & Kotlin Multiplatform
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to bg-clip-text text-transparent">
            Build Android Apps
            <br />
            Like Never Before
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The most powerful visual Android app editor. Create stunning mobile
            experiences with our intuitive drag-and-drop interface, real-time
            preview, and production-ready code generation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-gradient-from to-gradient-to hover:from-gradient-via hover:to-gradient-from"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Building Free
            </Button>
            <Button size="lg" variant="outline">
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </div>

          {/* Hero Image/Demo */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-6 shadow-2xl backdrop-blur">
              <div className="bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gradient-from to-gradient-to rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-muted-foreground">
                    Interactive App Editor Preview
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your app development workspace will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to build amazing apps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to deployment, AppForge provides all the tools and
              features you need to create professional Android applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-gradient-from to-gradient-via rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Visual Designer</CardTitle>
                <CardDescription>
                  Drag-and-drop interface with real-time preview. Design
                  beautiful UIs without writing code.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-gradient-via to-gradient-to rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Smart Code Generation</CardTitle>
                <CardDescription>
                  Generate clean, production-ready Kotlin code automatically.
                  Full control when you need it.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-gradient-from to-gradient-to rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Instant Preview</CardTitle>
                <CardDescription>
                  See your changes instantly on real devices. Test on multiple
                  screen sizes simultaneously.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-gradient-via to-gradient-from rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Work together in real-time. Share projects, leave comments,
                  and iterate faster.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-gradient-to to-gradient-via rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <CardTitle>One-Click Export</CardTitle>
                <CardDescription>
                  Export your app as APK, AAB, or Android Studio project. Deploy
                  to Play Store directly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-gradient-from to-gradient-to rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Modern Android</CardTitle>
                <CardDescription>
                  Built for the latest Android versions. Jetpack Compose,
                  Material Design 3, and more.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to build your next Android app?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of developers who are already building amazing apps
              with AppForge. Start for free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-gradient-from to-gradient-to hover:from-gradient-via hover:to-gradient-from"
              >
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-gradient-from to-gradient-to rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  AppForge
                </span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                The most powerful visual Android app editor. Build beautiful,
                production-ready apps faster than ever.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost">
                  <Github className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Templates
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Integrations
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Status
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AppForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
