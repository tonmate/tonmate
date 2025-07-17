import Link from 'next/link';
import { 
  BoltIcon, 
  ChartBarIcon, 
  CogIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  StarIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: BoltIcon,
      title: "Lightning Fast",
      description: "Deploy AI agents in minutes with pre-built templates and integrations."
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Multi-Channel",
      description: "Deploy across web, mobile, social media, and messaging platforms."
    },
    {
      icon: CogIcon,
      title: "Customizable",
      description: "Fine-tune responses, escalation rules, and brand personality."
    },
    {
      icon: ChartBarIcon,
      title: "Analytics",
      description: "Track performance, satisfaction scores, and conversation insights."
    },
    {
      icon: UserGroupIcon,
      title: "Team Collaboration",
      description: "Seamless handoff between AI and human agents when needed."
    },
    {
      icon: GlobeAltIcon,
      title: "Global Scale",
      description: "Support multiple languages and time zones automatically."
    },
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "SOC2 compliant with end-to-end encryption and data privacy."
    },
    {
      icon: SparklesIcon,
      title: "AI Learning",
      description: "Continuously improves from interactions and feedback."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Customer Success",
      company: "TechFlow",
      content: "Our response times improved by 80% after implementing SupportAI. The AI agents handle routine inquiries perfectly, letting our team focus on complex issues.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      company: "StartupCorp",
      content: "Integration was seamless and the customization options are incredible. Our customers love the instant, accurate responses 24/7.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Support Manager",
      company: "GrowthCo",
      content: "SupportAI scaled with our business perfectly. From 100 to 10,000 customers, it handles everything with consistent quality.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SupportAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              The modern AI support platform
              <span className="text-blue-600"> for your business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build AI-powered customer support agents trained on your website content. Deploy across multiple channels with custom rules, escalation logic, and brand personality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                Start Free Trial
                <span className="ml-2">→</span>
              </Link>
              <Link href="/dashboard" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                View Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>4.8/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>5,000+ businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-blue-500" />
                <span>Open source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to build AI support agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create, deploy, and manage intelligent support agents that learn from your content and provide instant, accurate responses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by businesses worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how companies are transforming their customer support with AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your customer support?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using AI to provide better customer experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
              Start Free Trial
            </Link>
            <Link href="/dashboard" className="border border-blue-400 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SupportAI</span>
              </div>
              <p className="text-gray-400">
                Build intelligent AI support agents for your business in minutes, not months.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/agents" className="text-gray-400 hover:text-white transition-colors">AI Agents</Link></li>
                <li><Link href="/analytics" className="text-gray-400 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SupportAI. Built with Next.js, AI, and innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
