"use client";

import { ReactNode } from 'react'
import { CustomSidebar } from "@/components/CustomSidebar"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Providers } from '@/components/Providers'
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'

interface DashboardLayoutProps {
  children: ReactNode
}


export function DashboardContent({ 
  children, 
}: DashboardLayoutProps) {
  const { leagues, selectedLeagueId, setSelectedLeagueId, isLoading } = useLeagueTeamData();

  const handleLeagueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const leagueId = event.target.value;
    setSelectedLeagueId(leagueId);
  };

  return (
      <Providers>
        <CustomSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto px-3">
              <div className="flex flex-col">
                {/* League Dropdown */}
                <div className="mt-2">
                  <select 
                    className="text-sm border rounded px-2 py-1 bg-background"
                    value={selectedLeagueId || ""}
                    onChange={handleLeagueChange}
                    disabled={isLoading}
                  >
                    <option value="">Select League...</option>
                    {leagues.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.externalLeagueId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </Providers>
  )
}