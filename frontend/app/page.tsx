"use client"
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  ChevronRight,
  Star
} from 'lucide-react';

export default function FantasyDashboard() {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}
      <nav className="w-full border-b border-gray-200 backdrop-blur-md bg-white/80">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              {/* <img src="/favicon.ico" alt="StatSphere" className="w-8 h-8" /> */}
              {/* <span className="text-xl font-bold text-gray-900">StatSphere</span> */}
            </div>
            <Button 
              onClick={handleSignInClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full overflow-hidden flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-blue-200/30 blur-3xl"></div>
        <div className="relative w-full px-6 lg:px-8 pt-20 pb-16 min-h-[calc(100vh-80px)] flex items-center">
          <div className="text-center w-full">
            <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">Everything you need to win</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 mb-7 leading-tight">
              The Ultimate
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent block">
                Fantasy Football Portal
              </span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced analytics, AI-powered insights, and real-time data to give you the competitive edge you need to win your fantasy championship.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleSignInClick}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 px-12 py-6 text-xl"
              >
                Sign In
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white/80 backdrop-blur-md mt-auto">
        <div className="w-full px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              {/* <img src="/favicon.ico" alt="StatSphere" className="w-8 h-8" /> */}
              {/* <span className="text-gray-900 font-bold text-xl">StatSphere</span> */}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-wrap justify-center gap-8 text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors">About</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
                {/* <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a> */}
                <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              </div>
              {/* <div className="text-gray-500 text-sm">
                © 2024 StatSphere. All rights reserved.
              </div> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}