import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">InstagramAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Customer Support for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Instagram Shops</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automate your Instagram customer support with intelligent AI that handles product inquiries, 
              order tracking, and customer service 24/7. Built with LangChain.js and OpenAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                Get Started Free
                <span className="ml-2">→</span>
              </Link>
              <Link href="/chat" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Instagram Commerce
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to provide exceptional customer support on Instagram
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Product Search</h3>
              <p className="text-gray-600">
                AI understands natural language queries to help customers find exactly what they&apos;re looking for
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-gray-600">
                Instant order status updates and tracking information for customer inquiries
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-gray-600">
                Never miss a customer inquiry with round-the-clock automated support
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-language Support</h3>
              <p className="text-gray-600">
                Communicate with customers in their preferred language automatically
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Policy Information</h3>
              <p className="text-gray-600">
                Instant access to return policies, shipping info, and store guidelines
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-gray-600">
                Simple webhook integration with Instagram Business API
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Try our AI customer support agent with real examples
            </p>
            <Link href="/chat" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
              Launch Interactive Demo
              <span className="ml-2">→</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Queries</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">&quot;Do you have white t-shirts in size M?&quot;</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">&quot;What&apos;s the status of order ORD-001?&quot;</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">&quot;What&apos;s your return policy?&quot;</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Capabilities</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Product search and recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Order status and tracking</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Store policies and information</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Natural conversation flow</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Deploy your AI customer support agent in minutes and start providing 24/7 support to your Instagram customers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Try Demo Now
            </Link>
            <a href="https://github.com/your-repo" className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <span className="text-xl font-bold">InstagramAI</span>
              </div>
              <p className="text-gray-400">
                AI-powered customer support for Instagram businesses
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Demo</Link></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InstagramAI. Built with Next.js, LangChain.js, and OpenAI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
