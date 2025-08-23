// context/LeagueDataContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react"; 
import { getLeaguesForUser } from "@/lib/leagueData";

type LeagueData = {
  leagues: League[];
  selectedLeagueId: string | null;
  setSelectedLeagueId: (leagueId: string) => void;
  isLoading: boolean;
  refreshLeagues: () => Promise<void>; // Add refresh function
};

const LeagueDataContext = createContext<LeagueData | undefined>(undefined);

export function LeagueDataProvider({ userId, children }: { userId: string, children: ReactNode }) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract the fetch logic into a reusable function
  const fetchLeagues = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await getLeaguesForUser(userId);

      const cleanedLeagues = data.map((league: any) => ({
        id: league.id,
        teamId: league.teamId,
        adminUserId: league.admin_user_id,
        externalLeagueId: league.external_league_id,
        espnS2: league.espn_s2,
        swid: league.swid,
        teams: league.teams.map((team: any) => ({
          id: team.id,
          team_name: team.team_name,
          team_abbrev: team.team_abbrev,
          espn_team_id: team.espn_team_id,
        })),
      }));

      setLeagues(cleanedLeagues);
      
      // Handle selectedLeagueId logic
      if (cleanedLeagues.length > 0) {
        // If current selection is still valid, keep it; otherwise, select first league
        const isCurrentSelectionValid = cleanedLeagues.some(league => league.id === selectedLeagueId);
        if (!isCurrentSelectionValid) {
          setSelectedLeagueId(cleanedLeagues[0].id);
        }
      } else {
        // No leagues available
        setSelectedLeagueId(null);
      }
    } catch (error) {
      console.error("Error fetching league data:", error);
      setLeagues([]);
      setSelectedLeagueId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Create the refresh function that can be called from components
  const refreshLeagues = async () => {
    await fetchLeagues();
  };

  // Initial fetch on mount
  useEffect(() => {
    if (userId) {
      fetchLeagues();
    }
  }, [userId]);

  const value: LeagueData = {
    leagues,
    selectedLeagueId,
    setSelectedLeagueId,
    isLoading,
    refreshLeagues, // Include the refresh function
  };

  return (
    <LeagueDataContext.Provider value={value}>
      {children}
    </LeagueDataContext.Provider>
  );
}

export function useLeagueTeamData() {
  const context = useContext(LeagueDataContext);
  if (!context) {
    throw new Error("useLeagueTeamData must be used within a LeagueDataProvider");
  }
  return context;
}