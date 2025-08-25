/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'
import { useState, JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Trophy, Medal, Award, BarChart3 } from 'lucide-react'
import { useFantasyData } from '@/context/FantasyDataContext'
import { useNFLData } from '@/context/NFLDataContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useUser } from '@/context/UserContext'
import { FantasyPlayerSeasonStats } from '@/lib/interfaces'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Slider } from "@/components/ui/slider"

interface PositionPlayerTiersProps {
  position: string
  defaultTierSize: number
  defaultGradingPlayersSize: number
}


export function PositionPlayerTiers({ position, defaultTierSize, defaultGradingPlayersSize}: PositionPlayerTiersProps) {
  const { currentYear } = useUser()
  const { fantasyDraftPicks, fantasyTeams, fantasyPlayersSeasonStats } = useFantasyData()
  const { nflPlayers, nflTeams } = useNFLData()

  const [tierSize, setTierSize] = useState(defaultTierSize)
  const [gradingPlayersSize, setGradingPlayersSize] = useState(defaultGradingPlayersSize)

  const getPlayersByPositionSortedByTotalPoints = (position: string) => {
    const players = nflPlayers.filter(player => player.position === position)

    const allPlayerStats = []
    for (const player of players) {
      const playerStats = fantasyPlayersSeasonStats.find(stat => stat.player_id === player.id)
      if (playerStats) {
        allPlayerStats.push({
          player_id: player.id,
          player_first_name: player.first_name,
          player_last_name: player.last_name,
          total_points: playerStats.total_points,
          position: player.position,
          team: player.team_id,
        })
      }
    }

    return allPlayerStats.sort((a, b) => b.total_points - a.total_points)
  }

  const getFantasyTeamForPlayer = (playerId: string) => {
    const draftPick = fantasyDraftPicks.find(pick => pick.player_id === playerId)
    if (draftPick) {
      return fantasyTeams.find(team => team.id === draftPick.team_id)
    }
    return null
  }

  const getNFLTeamForPlayer = (teamId: string) => {
    return nflTeams.find(team => team.id === teamId)
  }

  const getTierBadgeVariant = (tierNumber: number) => {
    switch (tierNumber) {
      case 1:
        return 'default'
      case 2:
        return 'secondary'
      case 3:
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getTierName = (tierNumber: number) => {
    switch (tierNumber) {
      case 1:
        return 'Elite'
      case 2:
        return 'Very Good'
      case 3:
        return 'Good'
      default:
        return 'Other'
    }
  }

  const sortedPlayers = getPlayersByPositionSortedByTotalPoints(position)

  const getPlayerTier = (index: number) => {
    if (index < tierSize) return 1
    if (index < tierSize * 2) return 2
    if (index < tierSize * 3) return 3
    return 4
  }

  // Generate chart data for team tier distribution
  const getTeamTierDistribution = () => {
    const teamData: { [teamId: string]: { teamName: string; tier1: number; tier2: number; tier3: number } } = {}
    
    // Initialize all teams
    fantasyTeams.forEach(team => {
      teamData[team.id] = {
        teamName: team.team_name,
        tier1: 0,
        tier2: 0,
        tier3: 0
      }
    })

    // Count players by tier for each team
    sortedPlayers.slice(0, tierSize * 3).forEach((player, index) => {
      const fantasyTeam = getFantasyTeamForPlayer(player.player_id)
      if (fantasyTeam) {
        const tier = getPlayerTier(index)
        if (tier === 1) teamData[fantasyTeam.id].tier1++
        else if (tier === 2) teamData[fantasyTeam.id].tier2++
        else if (tier === 3) teamData[fantasyTeam.id].tier3++
      }
    })

    // Convert to array format for Recharts
    return Object.values(teamData).map(team => ({
      name: team.teamName,
      'Tier 1 (Elite)': team.tier1,
      'Tier 2 (Very Good)': team.tier2,
      'Tier 3 (Good)': team.tier3,
      total: team.tier1 + team.tier2 + team.tier3
    })).sort((a, b) => b.total - a.total) // Sort by total players descending
  }

  const chartData = getTeamTierDistribution()

  // Calculate league-relative grades using z-scores
  const getLeagueRelativeGrades = () => {
    // First, get each team's players and sort them
    const teamPlayers: { [teamId: string]: { name: string; points: number; teamName: string }[] } = {}
    
    // Initialize teams
    fantasyTeams.forEach(team => {
      teamPlayers[team.id] = []
    })

    // Collect all rostered players by team
    sortedPlayers.forEach(player => {
      const fantasyTeam = getFantasyTeamForPlayer(player.player_id)
      if (fantasyTeam) {
        teamPlayers[fantasyTeam.id].push({
          name: `${player.player_first_name} ${player.player_last_name}`,
          points: player.total_points,
          teamName: fantasyTeam.team_name
        })
      }
    })

    // Get top 2 players from each team and collect their points
    const topPlayersPoints: number[] = []
    Object.values(teamPlayers).forEach(players => {
      const sortedTeamPlayers = players.sort((a, b) => b.points - a.points)
      const topPlayers = sortedTeamPlayers.slice(0, gradingPlayersSize)
      topPlayers.forEach(player => topPlayersPoints.push(player.points))
    })
    
    // Calculate league average and standard deviation for top N players only
    const leagueAverage = topPlayersPoints.reduce((sum, points) => sum + points, 0) / topPlayersPoints.length
    const variance = topPlayersPoints.reduce((sum, points) => sum + Math.pow(points - leagueAverage, 2), 0) / topPlayersPoints.length
    const standardDeviation = Math.sqrt(variance)

    const teamGrades: { [teamId: string]: { teamName: string; playerZScores: { name: string; points: number; zScore: number }[]; topPlayersAvgZScore: number; grade: string } } = {}
    
    // Initialize all teams
    fantasyTeams.forEach(team => {
      teamGrades[team.id] = {
        teamName: team.team_name,
        playerZScores: [],
        topPlayersAvgZScore: 0,
        grade: 'F'
      }
    })

    // Calculate z-scores for each team's players
    Object.entries(teamPlayers).forEach(([teamId, players]) => {
      const sortedTeamPlayers = players.sort((a, b) => b.points - a.points)
      sortedTeamPlayers.forEach(player => {
        const zScore = (player.points - leagueAverage) / standardDeviation
        teamGrades[teamId].playerZScores.push({
          name: player.name,
          points: player.points,
          zScore: zScore
        })
      })
    })

    // Calculate grades based on top 2 players' average z-score
    Object.values(teamGrades).forEach(team => {
      // Sort by z-score descending and take top 2
      const sortedZScores = team.playerZScores.sort((a, b) => b.zScore - a.zScore)
      const topTwo = sortedZScores.slice(0, 2)
      
      if (topTwo.length > 0) {
        team.topPlayersAvgZScore = topTwo.reduce((sum, player) => sum + player.zScore, 0) / topTwo.length
        
        // Assign letter grades based on z-score
        if (team.topPlayersAvgZScore >= 1.5) team.grade = 'A+'
        else if (team.topPlayersAvgZScore >= 1.0) team.grade = 'A'
        else if (team.topPlayersAvgZScore >= 0.5) team.grade = 'B+'
        else if (team.topPlayersAvgZScore >= 0.0) team.grade = 'B'
        else if (team.topPlayersAvgZScore >= -0.5) team.grade = 'C+'
        else if (team.topPlayersAvgZScore >= -1.0) team.grade = 'C'
        else if (team.topPlayersAvgZScore >= -1.5) team.grade = 'D'
        else team.grade = 'F'
      }
    })

    return Object.values(teamGrades).sort((a, b) => b.topPlayersAvgZScore - a.topPlayersAvgZScore)
  }

  const leagueGrades = getLeagueRelativeGrades()

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'text-green-600 bg-green-50'
      case 'B+': case 'B': return 'text-blue-600 bg-blue-50'
      case 'C+': case 'C': return 'text-yellow-600 bg-yellow-50'
      case 'D': return 'text-orange-600 bg-orange-50'
      case 'F': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            Total Players: {sortedPlayers.length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Tier Size: {tierSize}
          </Badge>
          <Slider 
            value={[tierSize]} 
            max={15} 
            min={1}
            step={1} 
            onValueChange={(value) => setTierSize(value[0])} 
            className="w-32"
          />
        </div>
      </div>

      {/* Team Tier Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {position} Tier Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Card className="p-3 shadow-lg">
                          <CardContent className="p-0">
                            <p className="font-medium">{`${label}`}</p>
                            {payload.map((entry, index) => (
                              <p key={index} style={{ color: entry.color }}>
                                {`${entry.dataKey}: ${entry.value}`}
                              </p>
                            ))}
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="Tier 1 (Elite)" 
                  fill="#22c55e" 
                  name="Tier 1 (Elite)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="Tier 2 (Very Good)" 
                  fill="#86efac" 
                  name="Tier 2 (Very Good)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="Tier 3 (Good)" 
                  fill="#bbf7d0" 
                  name="Tier 3 (Good)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Tier 1: Top {tierSize} players (Elite)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span>Tier 2: Players {tierSize + 1}-{tierSize * 2} (Very Good)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Tier 3: Players {tierSize * 2 + 1}-{tierSize * 3} (Good)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* League Relative Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {position} League Relative Grades
          </CardTitle>
          <div className="flex items-center gap-4 mt-4"> 
          <Badge variant="outline" className="px-3 py-1">
            Position Group Size: {gradingPlayersSize}
          </Badge>
          <Slider 
            value={[gradingPlayersSize]} 
            max={5} 
            min={1}
            step={1} 
            onValueChange={(value) => setGradingPlayersSize(value[0])} 
            className="w-32"
          />
          </div>
                  
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">League Relative Grading:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Z-Score:</strong> How many standard deviations above/below average among rostered {position} players</li>
              <li>• <strong>Grade:</strong> Average z-score of team&apos;s top {gradingPlayersSize} {position} players</li>
              <li>• <strong>Scale:</strong> A+ (≥1.5σ), A (≥1.0σ), B+ (≥0.5σ), B (≥0σ), C+ (≥-0.5σ), C (≥-1.0σ), D (≥-1.5σ), F (&lt;-1.5σ)</li>
            </ul>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="w-20 text-center">Grade</TableHead>
                <TableHead className="w-24 text-right">Avg Z-Score</TableHead>
                <TableHead>Top Players</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagueGrades.map((team, index) => (
                <TableRow key={team.teamName} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      #{index + 1}
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Award className="h-4 w-4 text-amber-600" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{team.teamName}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`font-bold ${getGradeColor(team.grade)}`}>
                      {team.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {team.topPlayersAvgZScore >= 0 ? '+' : ''}{team.topPlayersAvgZScore.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {team.playerZScores.slice(0, gradingPlayersSize).map((player, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({player.points.toFixed(1)} pts, z: {player.zScore >= 0 ? '+' : ''}{player.zScore.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead className="w-24">Tier</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="w-20">NFL Team</TableHead>
                <TableHead className="w-24 text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.slice(0, tierSize * 3).map((player, index) => {
                const fantasyTeam = getFantasyTeamForPlayer(player.player_id)
                const nflTeam = getNFLTeamForPlayer(player.team)
                const tier = getPlayerTier(index)
                
                return (
                  <TableRow 
                    key={player.player_id} 
                  >
                    <TableCell className="font-medium">
                      #{index + 1}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getTierBadgeVariant(tier)}
                        className={`flex items-center gap-1 w-fit ${
                          tier === 1 ? 'bg-green-700 text-white border-white' : 
                          tier === 2 ? 'bg-green-600 text-white border-white' : 
                          'bg-green-500 text-white border-white'
                        }`}
                      >
                        Tier {tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col mr-4">
                          <span className="font-semibold">
                            {player.player_first_name} {player.player_last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {position}
                          </span>
                        </div>
                        {fantasyTeam && (
                          <Badge 
                            variant="default"
                            className="text-xs"
                          >
                            {fantasyTeam.team_name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {nflTeam?.team_abbrev || 'FA'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {player.total_points.toFixed(1)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      
    </div>
  )
}