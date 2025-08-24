// components/Providers.tsx
"use client";

import { LeagueDataProvider } from "@/context/LeagueTeamDataContext";
import { NFLDataProvider } from "@/context/NFLDataContext";
import { FantasyDataProvider } from "@/context/FantasyDataContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from 'next/navigation';

// Inner component that can access UserContext
function InnerProviders({ year, children }: { year: number, children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
        </div>
      </div>
    );;
  }
  
  if (!user) {
    // Redirect to auth if no user is logged in
    router.push('/auth');
    return <div className="flex items-center justify-center h-screen">Redirecting to login...</div>;
  }

  return (
    <LeagueDataProvider userId={user.id}>
      <NFLDataProvider year={year}>
        <FantasyDataProvider year={year}>
          {children}
        </FantasyDataProvider>
      </NFLDataProvider> 
    </LeagueDataProvider>
  );
}

// Main Providers component (no UserContext access here)
export function Providers({ year, children }: { year: number, children: React.ReactNode }) {
  return (
    <InnerProviders year={year}>
      {children}
    </InnerProviders>
  );
}