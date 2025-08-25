'use client'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
  } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Info, ArrowRight } from 'lucide-react'
import { useFantasyData } from '@/context/FantasyDataContext';
import React from 'react';
interface WeeklyBreakdown {
  week: number;
  actualResult: 'W' | 'L';
  simulatedResult: 'W' | 'L';
  actualOpponent: string;
  simulatedOpponent: string;
  ourPoints: number;
  actualOpponentPoints: number;
  simulatedOpponentPoints: number;
  pointsDifference: number;
}

interface LuckAnalysis {
  teamId: string;
  teamName: string;
  actualWins: number;
  actualLosses: number;
  actualWinPct: number;
  actualPointsAgainst: number;
  averageWins: number;
  averageLosses: number;
  averageWinPct: number;
  luckScore: number;
  bestCaseWins: number;
  worstCaseWins: number;
  strengthOfSchedule: number;
  scheduleVariance: number;
  compositeLuckScore: number;
  allScheduleResults: Map<string, { wins: number; losses: number; pointsAgainst: number; weeklyBreakdown: WeeklyBreakdown[] }>;
}

export function LuckContent() {
  const { fantasyTeams, fantasyTeamsWeeklyStats, isLoading } = useFantasyData();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'comparison'>('overview');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const luckAnalysis = useMemo(() => {
    if (!fantasyTeams || !fantasyTeamsWeeklyStats) return [];

    const teamMap = new Map(fantasyTeams.map(team => [team.id, team]));

    const teamStats = new Map<string, any[]>();
    
    // Group stats by team
    fantasyTeamsWeeklyStats.forEach(stat => {
      if (!teamStats.has(stat.team_id)) {
        teamStats.set(stat.team_id, []);
      }
      teamStats.get(stat.team_id)!.push(stat);
    });

    const results: LuckAnalysis[] = [];

    // Calculate luck for each team
    teamStats.forEach((stats, teamId) => {
      const team = teamMap.get(teamId);
      if (!team) return;

      stats.sort((a, b) => a.week - b.week);
      
      const actualWins = stats.filter(s => s.win).length;
      const actualLosses = stats.length - actualWins;
      const actualWinPct = actualWins / stats.length;

      const actualPointsAgainst = stats.reduce((sum, s) => sum + s.points_against, 0);

      let totalWinsAcrossAllSchedules = 0;
      let scheduleCount = 0;
      let bestCaseWins = 0;
      let worstCaseWins = stats.length;
      let totalOpponentStrength = 0;
      const scheduleWinCounts: number[] = [];
      const allScheduleResults = new Map<string, { wins: number; losses: number; pointsAgainst: number; weeklyBreakdown: WeeklyBreakdown[] }>();

      // Try this team against every other team's schedule
      teamStats.forEach((otherStats, otherTeamId) => {
        if (otherTeamId === teamId) return;
        
        const otherTeam = teamMap.get(otherTeamId);
        if (!otherTeam) return;

        let winsAgainstThisSchedule = 0;
        let validGames = 0;
        const weeklyBreakdown: WeeklyBreakdown[] = [];

        let pointsAgainstForThisTeam = 0;

        otherStats.forEach(otherGame => {
          const ourGameThisWeek = stats.find(s => s.week === otherGame.week);
          if (!ourGameThisWeek) return;

          // Determine the opponent for the simulated game
          let simulatedOpponentId = otherGame.opponent_team_id;
          
          // If the simulated opponent is the team we're analyzing (teamId),
          // use the original opponent instead to preserve the matchup
          if (simulatedOpponentId === teamId) {
            simulatedOpponentId = ourGameThisWeek.opponent_team_id;
          }

          const opponentStats = teamStats.get(simulatedOpponentId);
          if (!opponentStats) return;

          const opponentGameThisWeek = opponentStats.find(s => s.week === otherGame.week);
          if (!opponentGameThisWeek) return;

          const actualOpponentTeam = teamMap.get(ourGameThisWeek.opponent_team_id);
          const simulatedOpponentTeam = teamMap.get(simulatedOpponentId);

          const simulatedWin = ourGameThisWeek.points_for > opponentGameThisWeek.points_for;
          if (simulatedWin) winsAgainstThisSchedule++;

          weeklyBreakdown.push({
            week: otherGame.week,
            actualResult: ourGameThisWeek.win ? 'W' : 'L',
            simulatedResult: simulatedWin ? 'W' : 'L',
            actualOpponent: actualOpponentTeam?.team_name || 'Unknown',
            simulatedOpponent: simulatedOpponentTeam?.team_name || 'Unknown',
            ourPoints: ourGameThisWeek.points_for,
            actualOpponentPoints: ourGameThisWeek.points_against,
            simulatedOpponentPoints: opponentGameThisWeek.points_for,
            pointsDifference: ourGameThisWeek.points_for - opponentGameThisWeek.points_for
          });

          validGames++;
          totalOpponentStrength += opponentGameThisWeek.points_for;
          pointsAgainstForThisTeam += opponentGameThisWeek.points_for;
        });

        if (validGames > 0) {
          totalWinsAcrossAllSchedules += winsAgainstThisSchedule;
          scheduleCount++;
          bestCaseWins = Math.max(bestCaseWins, winsAgainstThisSchedule);
          worstCaseWins = Math.min(worstCaseWins, winsAgainstThisSchedule);
          scheduleWinCounts.push(winsAgainstThisSchedule);

          
          allScheduleResults.set(otherTeamId, {
            wins: winsAgainstThisSchedule,
            losses: validGames - winsAgainstThisSchedule,
            pointsAgainst: pointsAgainstForThisTeam,
            weeklyBreakdown: weeklyBreakdown.sort((a, b) => a.week - b.week)
          });
        }
      });

      const averageWins = scheduleCount > 0 ? totalWinsAcrossAllSchedules / scheduleCount : actualWins;
      const averageLosses = stats.length - averageWins;
      const averageWinPct = averageWins / stats.length;
      const luckScore = actualWins - averageWins;
      const strengthOfSchedule = totalOpponentStrength / stats.length / scheduleCount || 0;
      
      // Calculate schedule variance (how much schedules differ)
      const variance = scheduleWinCounts.length > 1 
        ? scheduleWinCounts.reduce((sum, wins) => sum + Math.pow(wins - averageWins, 2), 0) / scheduleWinCounts.length
        : 0;
      const scheduleVariance = Math.sqrt(variance);
      
      // Composite luck score: combines schedule luck with strength of schedule impact
      const avgLeagueStrength = totalOpponentStrength / scheduleCount / stats.length || 100;
      const scheduleStrengthImpact = (avgLeagueStrength - strengthOfSchedule) / avgLeagueStrength;
      const compositeLuckScore = luckScore + (scheduleStrengthImpact * 2); // Weight SOS impact

      results.push({
        teamId,
        teamName: team.team_name,
        actualWins,
        actualLosses,
        actualWinPct,
        actualPointsAgainst,
        averageWins,
        averageLosses,
        averageWinPct,
        luckScore,
        bestCaseWins,
        worstCaseWins,
        strengthOfSchedule,
        scheduleVariance,
        compositeLuckScore,
        allScheduleResults
      });
    });

    return results.sort((a, b) => b.compositeLuckScore - a.compositeLuckScore);
  }, [fantasyTeams, fantasyTeamsWeeklyStats]);

  const selectedTeamData = selectedTeam ? luckAnalysis.find(t => t.teamId === selectedTeam) : null;
  
  const toggleRowExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedRows(newExpanded);
  };

  const getLuckBadge = (luckScore: number) => {
    if (luckScore >= 2) return <Badge className="bg-green-500">Very Lucky</Badge>;
    if (luckScore >= 1) return <Badge className="bg-green-400">Lucky</Badge>;
    if (luckScore >= -1) return <Badge variant="secondary">Average</Badge>;
    if (luckScore >= -2) return <Badge className="bg-red-400">Unlucky</Badge>;
    return <Badge className="bg-red-500">Very Unlucky</Badge>;
  };

  const getCompositeBadge = (score: number) => {
    if (score >= 2.5) return <Badge className="bg-emerald-500"><TrendingUp className="w-3 h-3 mr-1" />Extremely Lucky</Badge>;
    if (score >= 1.5) return <Badge className="bg-green-500">Very Lucky</Badge>;
    if (score >= 0.5) return <Badge className="bg-green-400">Lucky</Badge>;
    if (score >= -0.5) return <Badge variant="secondary">Average</Badge>;
    if (score >= -1.5) return <Badge className="bg-red-400">Unlucky</Badge>;
    if (score >= -2.5) return <Badge className="bg-red-500">Very Unlucky</Badge>;
    return <Badge className="bg-red-600"><TrendingDown className="w-3 h-3 mr-1" />Extremely Unlucky</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold">Luck</h1>
            <p className="text-muted-foreground">How lucky are you?</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading luck analysis...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewMode === 'comparison' && selectedTeamData) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={() => setViewMode('overview')} className="w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
            <h1 className="text-3xl font-bold mt-4">{selectedTeamData.teamName} - Schedule Analysis</h1>
            <p className="text-muted-foreground">
              Actual: {selectedTeamData.actualWins}-{selectedTeamData.actualLosses} | 
              Expected: {selectedTeamData.averageWins.toFixed(1)}-{selectedTeamData.averageLosses.toFixed(1)}
            </p>
          </div>
          <div className="text-right pr-4 border-r">
            <div className="text-2xl font-bold">
              Composite Luck: {selectedTeamData.compositeLuckScore > 0 ? '+' : ''}{selectedTeamData.compositeLuckScore.toFixed(2)}
            </div>
            <div className="mt-1">
              {getCompositeBadge(selectedTeamData.compositeLuckScore)}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alternative Schedule Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on any row to expand and see week-by-week breakdown
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-8"></TableHead>
                    <TableHead>Team&apos;s Schedule</TableHead>
                    <TableHead className="text-center">Record</TableHead>
                    <TableHead className="text-center">Win %</TableHead>
                    <TableHead className="text-center">Points Against</TableHead>
                    <TableHead className="text-center">Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(selectedTeamData.allScheduleResults.entries())
                    .sort((a, b) => b[1].wins - a[1].wins)
                    .map(([scheduleTeamId, result]) => {
                      const scheduleTeam = luckAnalysis.find(t => t.teamId === scheduleTeamId);
                      if (!scheduleTeam) return null;
                      
                      const winDiff = result.wins - selectedTeamData.actualWins;
                      const isExpanded = expandedRows.has(scheduleTeamId);
                      
                      return (
                        <React.Fragment key={scheduleTeamId}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRowExpansion(scheduleTeamId)}
                          >
                            <TableCell className="pl-6">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{scheduleTeam.teamName}</TableCell>
                            <TableCell className="text-center">
                              <span className="font-bold">{result.wins}-{result.losses}</span> 
                              <span className={winDiff > 0 ? 'text-green-600' : winDiff < 0 ? 'text-red-600' : ''}>
                                &nbsp;({winDiff > 0 ? '+' : ''}{winDiff})
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {((result.wins / (result.wins + result.losses)) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-center">
                              {result.pointsAgainst.toFixed(1)} 
                              <span className={result.pointsAgainst > selectedTeamData.actualPointsAgainst ? 'text-red-600' : result.pointsAgainst < selectedTeamData.actualPointsAgainst ? 'text-green-600' : ''}>
                                &nbsp;({result.pointsAgainst > selectedTeamData.actualPointsAgainst ? '+' : ''}{(result.pointsAgainst - selectedTeamData.actualPointsAgainst).toFixed(1)})
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {winDiff > 1 && <Badge className="bg-green-500">Much Better</Badge>}
                              {winDiff === 1 && <Badge className="bg-green-400">Better</Badge>}
                              {winDiff === 0 && <Badge variant="secondary">Same</Badge>}
                              {winDiff === -1 && <Badge className="bg-red-400">Worse</Badge>}
                              {winDiff < -1 && <Badge className="bg-red-500">Much Worse</Badge>}
                            </TableCell>
                          </TableRow>
                          
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="p-0">
                                <div className="bg-muted/30 p-4">
                                  <h4 className="font-semibold mb-3">
                                    Week-by-Week: {selectedTeamData.teamName} vs {scheduleTeam.teamName}&apos;s Schedule
                                  </h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-xs">Week</TableHead>
                                        <TableHead className="text-xs">Our Points</TableHead>
                                        <TableHead className="text-xs">Actual Opponent</TableHead>
                                        <TableHead className="text-xs">Actual Result</TableHead>
                                        <TableHead className="text-xs">Simulated Opponent</TableHead>
                                        <TableHead className="text-xs">Simulated Result</TableHead>
                                        <TableHead className="text-xs">Point Diff</TableHead>
                                        <TableHead className="text-xs">Impact</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {result.weeklyBreakdown.map((week) => (
                                        <TableRow key={week.week} className="text-sm">
                                          <TableCell className="font-medium">Week {week.week}</TableCell>
                                          <TableCell>{week.ourPoints.toFixed(1)}</TableCell>
                                          <TableCell>{week.actualOpponent} ({week.actualOpponentPoints.toFixed(1)})</TableCell>
                                          <TableCell>
                                            <Badge 
                                              variant={week.actualResult === 'W' ? 'default' : 'secondary'}
                                              className={`text-xs ${
                                                week.actualResult === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                              }`}
                                            >
                                              {week.actualResult}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="relative">
                                            {week.simulatedOpponent} ({week.simulatedOpponentPoints.toFixed(1)})
                                            {week.simulatedOpponent === week.actualOpponent && (
                                                <HoverCard openDelay={150}>
                                                <HoverCardTrigger asChild>
                                                    <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-1 h-3 w-3 p-0 text-muted-foreground hover:text-foreground"
                                                    >
                                                    <Info className="h-2 w-2" />
                                                    <span className="sr-only">Simulation note</span>
                                                    </Button>
                                                </HoverCardTrigger>

                                                <HoverCardContent className="w-80">
                                                    <div className="flex items-start gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium">Opponent preserved</p>
                                                        <p className="text-sm text-muted-foreground">
                                                        In this simulation, we preserve the original opponent in weeks where a
                                                        team would have played themselves.
                                                        </p>
                                                    </div>
                                                    </div>
                                                </HoverCardContent>
                                                </HoverCard>
                                            )}
                                            </TableCell>
                                          <TableCell>
                                            <Badge 
                                              variant={week.simulatedResult === 'W' ? 'default' : 'secondary'}
                                              className={`text-xs ${
                                                week.simulatedResult === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                              }`}
                                            >
                                              {week.simulatedResult}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className={week.pointsDifference > 0 ? 'text-green-600' : 'text-red-600'}>
                                            {week.pointsDifference > 0 ? '+' : ''}{week.pointsDifference.toFixed(1)}
                                          </TableCell>
                                          <TableCell>
                                            {week.actualResult !== week.simulatedResult && (
                                              <Badge
                                              variant={week.simulatedResult === 'W' ? 'default' : 'destructive'}
                                              className={`text-xs ${
                                                week.simulatedResult === 'W' ? 'bg-green-600 text-white' : ''
                                              }`}
                                            >
                                              {week.simulatedResult === 'W' ? 'Gained W' : 'Lost W'}
                                            </Badge>
                                            
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Luck Rankings</h1>
          <p className="text-muted-foreground">Comprehensive luck analysis with composite scoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Details</span>
            <Switch checked={showDetails} onCheckedChange={setShowDetails} />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 pt-4 space-y-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Fantasy Football Luck Rankings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ranked by composite luck score (combines schedule luck + strength of schedule impact)
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-400px)] overflow-auto">
              <Table className={showDetails ? "table-fixed" : ""}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={showDetails ? "w-[6%]" : "w-[50px]"}></TableHead>
                    <TableHead className={showDetails ? "w-[18%]" : "w-[200px]"}>Team</TableHead>
                    <TableHead className={showDetails ? "w-[12%] text-center" : "text-center"}>Actual Record</TableHead>
                    <TableHead className={showDetails ? "w-[12%] text-center" : "text-center"}>Expected Record</TableHead>
                    <TableHead className={showDetails ? "w-[10%] text-center" : "text-center"}>Schedule Luck</TableHead>
                    <TableHead className={showDetails ? "w-[10%] text-center" : "text-center"}>Composite Score</TableHead>
                    <TableHead className={showDetails ? "w-[12%] text-center" : "text-center"}>Overall Rating</TableHead>
                    {showDetails && (
                      <>
                        <TableHead className="w-[7%] text-center">Best Case</TableHead>
                        <TableHead className="w-[7%] text-center">Worst Case</TableHead>
                        <TableHead className="w-[6%] text-center">Variance</TableHead>
                        <TableHead className="w-[6%] text-center">SOS</TableHead>
                      </>
                    )}
                    <TableHead className={showDetails ? "w-[8%] text-center" : "text-center"}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {luckAnalysis.map((team, index) => (
                    <TableRow key={team.teamId}>
                      <TableCell className="text-center">
                        <Badge variant="outline">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium truncate">{team.teamName}</TableCell>
                      <TableCell className="text-center">
                        {team.actualWins}-{team.actualLosses}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.averageWins.toFixed(1)}-{team.averageLosses.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={team.luckScore > 0 ? 'text-green-600' : team.luckScore < 0 ? 'text-red-600' : ''}>
                          {team.luckScore > 0 ? '+' : ''}{team.luckScore.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={team.compositeLuckScore > 0 ? 'text-green-600 font-semibold' : team.compositeLuckScore < 0 ? 'text-red-600 font-semibold' : 'font-semibold'}>
                          {team.compositeLuckScore > 0 ? '+' : ''}{team.compositeLuckScore.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getCompositeBadge(team.compositeLuckScore)}
                      </TableCell>
                      {showDetails && (
                        <>
                          <TableCell key={`${team.teamId}-bestcase`} className="text-center text-green-600">
                            {team.bestCaseWins}W
                          </TableCell>
                          <TableCell key={`${team.teamId}-worstcase`} className="text-center text-red-600">
                            {team.worstCaseWins}W
                          </TableCell>
                          <TableCell key={`${team.teamId}-variance`} className="text-center">
                            {team.scheduleVariance.toFixed(1)}
                          </TableCell>
                          <TableCell key={`${team.teamId}-sos`} className="text-center">
                            {team.strengthOfSchedule.toFixed(1)}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeam(team.teamId);
                            setViewMode('comparison');
                          }}
                          className={showDetails ? "text-xs px-2" : ""}
                        >
                          Analyze
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Composite Luck Score:</h4>
                <p className="text-muted-foreground">
                  Combines schedule luck with strength of schedule impact. Higher scores indicate more favorable circumstances overall.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Schedule Analysis:</h4>
                <p className="text-muted-foreground">
                  Click &quot;Analyze&quot; to see how each team would perform with different schedules, including week-by-week breakdowns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key Metrics:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong>Variance:</strong> How much schedules would change outcomes</li>
                  <li><strong>SOS:</strong> Average opponent strength faced</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}