// components/HomeContent.tsx
"use client";

import { useState } from 'react';
import { useLeagueTeamData } from "@/context/LeagueTeamDataContext";
import { useUser } from "@/context/UserContext";
import { JoinLeagueModal } from "@/components/LeagueComponents/JoinLeagueModal";
import { RegisterLeagueModal } from "@/components/LeagueComponents/RegisterLeagueModal";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export function HomeContent() {
  const { selectedLeagueId, leagues, isLoading, refreshLeagues} = useLeagueTeamData();
  const { user } = useUser();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Show league selection if user has no leagues or no selected league
  const showLeagueSelection = !isLoading && (!leagues?.length || !selectedLeagueId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your leagues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ESPN FF Advanced Stats</h1>
        <p className="text-xl text-muted-foreground">
          Advanced analytics for your fantasy football league
        </p>
      </div>

      

      {showLeagueSelection ? (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
            <p className="text-muted-foreground mb-6">
              To access advanced stats, you need to join or register a league.
            </p>
          </div>

          {/* Always show join/register buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => setShowJoinModal(true)}
              className="text-sm px-4 py-2"
              variant="outline"
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Join League
            </Button>

            <Button 
              onClick={() => setShowRegisterModal(true)}
              className="text-sm px-4 py-2"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Register League
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              <strong>Join League:</strong> Join a league that&apos;s already been registered by another user.
            </p>
            <p className="mt-2">
              <strong>Register League:</strong> Register your ESPN league for the first time (requires ESPN S2 & SWID).
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">League Median</h3>
            <p className="text-muted-foreground">
              Track team performance against league median scores each week.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Points Missed</h3>
            <p className="text-muted-foreground">
              Analyze points left on your bench and optimize your lineup decisions.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Draft Analysis</h3>
            <p className="text-muted-foreground">
              Review your draft performance and identify value picks and reaches.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Player Tiers</h3>
            <p className="text-muted-foreground">
              View players organized by performance tiers and positional rankings.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Trade Evaluators</h3>
            <p className="text-muted-foreground">
              Evaluate potential trades and their impact on your team&apos;s performance.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Research Tools</h3>
            <p className="text-muted-foreground">
              Volume analysis and comprehensive player rankings for informed decisions.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <JoinLeagueModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        userId={user?.id || null}
        onRefresh={refreshLeagues}
      />

      <RegisterLeagueModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        userId={user?.id || null}
        onRefresh={refreshLeagues}
      />
    </div>
  );
}