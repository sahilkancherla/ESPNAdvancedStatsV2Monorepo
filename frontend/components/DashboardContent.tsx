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
  const { leagues, selectedLeagueId } = useLeagueTeamData();

  // const handleLeagueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const leagueId = event.target.value;
  //   setSelectedLeagueId(leagueId);
  // };

  return (
      <Providers>
        <CustomSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto px-3">
              <div className="flex flex-col">
                {/* Selected League Display */}
                <div className="mt-2">
                  <span className="text-sm px-2 py-1">
                    {selectedLeagueId ? 
                      "League Id: " + leagues.find(league => league.id === selectedLeagueId)?.externalLeagueId || selectedLeagueId
                      : "No League Selected"
                    }
                  </span>
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