'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingDown, AlertTriangle, Trophy, Target, Users, ArrowUpDown } from 'lucide-react'
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'
import { useFantasyData } from '@/context/FantasyDataContext'
import { useNFLData } from '@/context/NFLDataContext'

// Placeholder data
const weeks = Array.from({ length: 17 }, (_, i) => i + 1)

const displayOrder = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'D/ST']

export function PointsMissedContent() {
  const [selectedWeek, setSelectedWeek] = useState('1')
  const [viewMode, setViewMode] = useState<'team' | 'league'>('team')

  const { nflTeams, nflPlayers } = useNFLData();
  const { fantasyTeams, fantasyPlayersWeeklyStats, isLoading } = useFantasyData();
  const { selectedLeagueId, leagues } = useLeagueTeamData();
  
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId);
  const myTeam = selectedLeague?.teams.find(team => team.id === selectedLeague?.teamId);
  const myTeamId = myTeam?.id;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-muted-foreground">Loading fantasy data...</p>
          </div>
        </div>
      </div>
    )
  }

  const myTeamWeeklyStats = fantasyPlayersWeeklyStats.filter(
    p => p.team_id === myTeamId && p.week === parseInt(selectedWeek)
  );

  console.log(myTeamWeeklyStats);

  if (myTeamWeeklyStats.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Points Missed Analysis</h1>
            <p className="text-muted-foreground">Optimize your lineup decisions and minimize bench points</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map(week => (
                  <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No data available for Week {selectedWeek}</p>
          </div>
        </div>
      </div>
    )
  }

  // Get player details with NFL data
  const getPlayerLineup = () => {
    const startedPlayers = myTeamWeeklyStats.filter(stat => stat.slot && stat.slot !== 'BE' && stat.slot !== 'IR');
    const benchPlayers = myTeamWeeklyStats.filter(stat => stat.slot && stat.slot.includes('BE'));
    
    const lineup = startedPlayers.map(stat => {
      const nflPlayer = nflPlayers.find(p => p.id === stat.player_id);
      return {
        position: stat.slot || 'UNKNOWN',
        player: nflPlayer?.first_name + ' ' + nflPlayer?.last_name || 'Unknown Player',
        points: stat.actual_fantasy_points,
        isStarted: true,
        playerId: stat.player_id
      };
    });

    // Sort lineup by display order
    const sortedLineup = displayOrder.map(pos => {
      const playerInPos = lineup.find(p => p.position === pos);
      if (playerInPos) {
        // Remove from lineup array to avoid duplicates
        const index = lineup.indexOf(playerInPos);
        lineup.splice(index, 1);
        return playerInPos;
      }
      return null;
    }).filter(Boolean);

    // Add any remaining players that didn't match the display order
    sortedLineup.push(...lineup);

    return {
      startingLineup: sortedLineup,
      benchPlayers: benchPlayers.map(stat => {
        const nflPlayer = nflPlayers.find(p => p.id === stat.player_id);
        return {
          position: nflPlayer?.position || 'UNKNOWN',
          player: nflPlayer?.first_name + ' ' + nflPlayer?.last_name || 'Unknown Player',
          points: stat.actual_fantasy_points,
          isStarted: stat.slot && !stat.slot.includes('BE'),
          playerId: stat.player_id
        };
      })
    };
  };

  const { startingLineup, benchPlayers } = getPlayerLineup();
  
  const totalStartedPoints = startingLineup.reduce((sum, p) => sum + p.points, 0);
  const totalBenchPoints = benchPlayers.reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Points Missed Analysis</h1>
          <p className="text-muted-foreground">Optimize your lineup decisions and minimize bench points</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map(week => (
                <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex bg-muted rounded-md p-1">
            <Button 
              variant={viewMode === 'team' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('team')}
            >
              My Team
            </Button>
            <Button 
              variant={viewMode === 'league' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('league')}
            >
              League
            </Button>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Started Points</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStartedPoints.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Week {selectedWeek}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bench Points</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalBenchPoints.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Points on bench</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starting Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startingLineup.length}</div>
            <p className="text-xs text-muted-foreground">In lineup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bench Players</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{benchPlayers.length}</div>
            <p className="text-xs text-muted-foreground">Available options</p>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'team' ? (
        /* Team View */
        <div className="space-y-6">
          {/* Lineup Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Starting Lineup - Week {selectedWeek}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {startingLineup.map((player, index) => (
                    <div key={`${player.playerId}-${index}`} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          {player.position}
                        </Badge>
                        <span className="font-medium">{player.player}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-green-600">{player.points.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="font-mono text-green-600">{totalStartedPoints.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bench Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {benchPlayers.length > 0 ? (
                    <>
                      {benchPlayers.map((player, index) => (
                        <div key={`${player.playerId}-bench-${index}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{player.position}</Badge>
                            <span className="font-medium">{player.player}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold">{player.points.toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-3 flex justify-between font-bold text-gray-600">
                        <span>Bench Total:</span>
                        <span className="font-mono">{totalBenchPoints.toFixed(1)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No bench players for this week</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>All Players - Week {selectedWeek}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Position</th>
                      <th className="text-left py-3 px-4">Player</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Starting Lineup */}
                    {startingLineup.map((player, index) => (
                      <tr key={`table-start-${player.playerId}-${index}`} className="border-b hover:bg-green-50">
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            {player.position}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{player.player}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="default" className="bg-green-600">Started</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-green-600">
                          {player.points.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                    {/* Bench Players */}
                    {benchPlayers.map((player, index) => (
                      <tr key={`table-bench-${player.playerId}-${index}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <Badge variant="secondary">{player.position}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{player.player}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">Bench</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {player.points.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* League View - Placeholder for now */
        <Card>
          <CardHeader>
            <CardTitle>League Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <Trophy className="h-12 w-12 mx-auto mb-2" />
              <p>League comparison coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Week {selectedWeek} Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Starting Lineup</h4>
              <p className="text-sm">
                <span className="font-medium">{startingLineup.length} players</span> scored{' '}
                <span className="text-green-600 font-mono font-bold">{totalStartedPoints.toFixed(1)}</span> total points
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Bench Performance</h4>
              <p className="text-sm">
                <span className="font-medium">{benchPlayers.length} bench players</span> scored{' '}
                <span className="text-red-600 font-mono font-bold">{totalBenchPoints.toFixed(1)}</span> total points
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Total Roster</h4>
              <p className="text-sm">
                <span className="font-medium">{startingLineup.length + benchPlayers.length} total players</span> scored{' '}
                <span className="text-blue-600 font-mono font-bold">{(totalStartedPoints + totalBenchPoints).toFixed(1)}</span> combined points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}