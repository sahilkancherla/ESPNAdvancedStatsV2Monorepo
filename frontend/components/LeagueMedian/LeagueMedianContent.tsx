'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Settings } from 'lucide-react'
import { useFantasyData } from '@/context/FantasyDataContext'
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'

// Placeholder data
const weeks = Array.from({ length: 17 }, (_, i) => i + 1)

export function LeagueMedianContent() {

  const { selectedLeagueId, leagues } = useLeagueTeamData();
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId);
  const selectedLeagueTeamsIds = selectedLeague?.teams.map((team: { id: string }) => team.id);
  const myTeam = selectedLeague?.teams.find(team => team.id === selectedLeague?.teamId);
  const myTeamId = myTeam?.id;

  console.log("myTeamId", myTeamId)
  
  const { fantasyTeams, fantasyTeamsWeeklyStats, isLoading } = useFantasyData();
  const [selectedWeek, setSelectedWeek] = useState('1')
  const [teamsToIncludeForLeagueMedianCalculation, setTeamsToIncludeForLeagueMedianCalculation] = useState<string[]>(selectedLeagueTeamsIds || [])

  // Early return if data is still loading or empty
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

  // Early return if no weekly stats for selected week
  const currentWeekFantasyTeamsWeeklyStats = fantasyTeamsWeeklyStats.filter(stat => stat.week === parseInt(selectedWeek))
  
  if (currentWeekFantasyTeamsWeeklyStats.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">League Median Analysis</h1>
            <p className="text-muted-foreground">Track team performance against league median scores</p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Teams ({teamsToIncludeForLeagueMedianCalculation.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Teams for Median Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      Select which teams to include in the league median calculation
                    </p>
                  </div>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {selectedLeague?.teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={team.id}
                          checked={teamsToIncludeForLeagueMedianCalculation.includes(team.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTeamsToIncludeForLeagueMedianCalculation(prev => [...prev, team.id])
                            } else {
                              setTeamsToIncludeForLeagueMedianCalculation(prev => prev.filter(id => id !== team.id))
                            }
                          }}
                        />
                        <label
                          htmlFor={team.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {fantasyTeams.find(ft => ft.id === team.id)?.team_name || 'Unknown Team'}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTeamsToIncludeForLeagueMedianCalculation(selectedLeagueTeamsIds || [])}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTeamsToIncludeForLeagueMedianCalculation([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

  const getMedianValueForWeek = () => {
    // Filter to only include teams selected for median calculation
    const filteredStats = currentWeekFantasyTeamsWeeklyStats.filter(stat => 
      teamsToIncludeForLeagueMedianCalculation.includes(stat.team_id)
    )
    
    if (filteredStats.length === 0) return 0
    
    const scores = filteredStats.map(t => t.points_for).sort((a, b) => a - b)
    const median = scores.length % 2 === 0 
      ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
      : scores[Math.floor(scores.length / 2)]
    return parseFloat(median.toFixed(2))
  }

  const getMaxValueForWeek = () => {
    const scores = currentWeekFantasyTeamsWeeklyStats.map(t => t.points_for).sort((a, b) => b - a)
    return parseFloat(scores[0].toFixed(2))
  }

  const getMinValueForWeek = () => {
    const scores = currentWeekFantasyTeamsWeeklyStats.map(t => t.points_for).sort((a, b) => a - b)
    return parseFloat(scores[0].toFixed(2))
  }

  const getMaxTeamForWeek = () => {
    const scores = currentWeekFantasyTeamsWeeklyStats.map(t => t.points_for).sort((a, b) => b - a)
    const max_score_team_id = currentWeekFantasyTeamsWeeklyStats.find(t => t.points_for === scores[0])?.team_id
    const max_score_team = fantasyTeams.find(t => t.id === max_score_team_id)?.team_name
    return max_score_team;
  }

  const getMinTeamForWeek = () => {
    const scores = currentWeekFantasyTeamsWeeklyStats.map(t => t.points_for).sort((a, b) => a - b)
    const min_score_team_id = currentWeekFantasyTeamsWeeklyStats.find(t => t.points_for === scores[0])?.team_id
    const min_score_team = fantasyTeams.find(t => t.id === min_score_team_id)?.team_name
    return min_score_team;
  }

  const getYourScoreForWeek = () => {
    const myTeamStats = currentWeekFantasyTeamsWeeklyStats.find(stat => stat.team_id === myTeamId)
    return myTeamStats ? parseFloat(myTeamStats.points_for.toFixed(2)) : 0
  }
  
  const getMedianTrend = (score: number, median: number) => {
    const diff = score - median
    if (Math.abs(diff) < 1) return { icon: Minus, color: 'text-gray-500', text: 'Even' }
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-600', text: `+${diff.toFixed(1)}` }
    return { icon: TrendingDown, color: 'text-red-600', text: diff.toFixed(1) }
  }

  const chartData = currentWeekFantasyTeamsWeeklyStats
    .sort((a, b) => b.points_for - a.points_for)
    .map((teamWeeklyStats, index) => ({
      team: fantasyTeams.find(t => t.id === teamWeeklyStats.team_id)?.team_abbrev || 'Unknown Team',
      team_id: teamWeeklyStats.team_id,
      team_name: fantasyTeams.find(t => t.id === teamWeeklyStats.team_id)?.team_name || 'Unknown Team',
      score: teamWeeklyStats.points_for,
      rank: index + 1
    }))

  const realMedian = getMedianValueForWeek()
  const yourScore = getYourScoreForWeek()
  const yourTrend = getMedianTrend(yourScore, realMedian)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">League Median Analysis</h1>
          <p className="text-muted-foreground">Track team performance against league median scores</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Teams ({teamsToIncludeForLeagueMedianCalculation.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Teams for Median Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    Select which teams to include in the league median calculation
                  </p>
                </div>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {selectedLeague?.teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={team.id}
                        checked={teamsToIncludeForLeagueMedianCalculation.includes(team.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTeamsToIncludeForLeagueMedianCalculation(prev => [...prev, team.id])
                          } else {
                            setTeamsToIncludeForLeagueMedianCalculation(prev => prev.filter(id => id !== team.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={team.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {fantasyTeams.find(ft => ft.id === team.id)?.team_name || 'Unknown Team'}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTeamsToIncludeForLeagueMedianCalculation(selectedLeagueTeamsIds || [])}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTeamsToIncludeForLeagueMedianCalculation([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamsToIncludeForLeagueMedianCalculation.length === 0 ? 'N/A' : getMedianValueForWeek()}
            </div>
            <p className="text-xs text-muted-foreground">
              Week {selectedWeek} ({teamsToIncludeForLeagueMedianCalculation.length} teams)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yourScore || 'N/A'}</div>
            {yourScore > 0 && teamsToIncludeForLeagueMedianCalculation.length > 0 && (
              <p className={`text-xs ${yourTrend.color}`}>
                {yourTrend.text} vs Median
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getMaxValueForWeek()}</div>
            <p className="text-xs text-muted-foreground">{getMaxTeamForWeek()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMinValueForWeek()}
            </div>
            <p className="text-xs text-muted-foreground">{getMinTeamForWeek()}</p>
          </CardContent>
        </Card>
      </div>

      {teamsToIncludeForLeagueMedianCalculation.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="">
            <div className="flex items-center gap-2 text-amber-800">
              <p className="font-medium">No teams selected for median calculation</p>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Please select at least one team using the &quot;Teams&quot; button above to calculate the league median.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Week Scores Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Week {selectedWeek} Team Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="team" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis />
                    <Tooltip 
                        content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                <p className="font-semibold">{data.team_name}</p>
                                <p className="text-sm text-gray-500">{label}</p>
                                <p className="text-blue-600">
                                Score: <span className="font-mono">{payload[0].value}</span>
                                </p>
                                <p className="text-gray-600">Rank: #{data.rank}</p>
                                {realMedian > 0 && (
                                  <p
                                  className={`${
                                      data.score > realMedian ? "text-green-600" : "text-red-600"
                                  }`}
                                  >
                                  vs Median:{" "}
                                  {data.score > realMedian ? "+" : ""}
                                  {(data.score - realMedian).toFixed(1)}
                                  </p>
                                )}
                                {teamsToIncludeForLeagueMedianCalculation.includes(data.team_id) && (
                                  <p className="text-xs text-blue-600">✓ Included in median</p>
                                )}
                            </div>
                            );
                        }
                        return null;
                        }}
                    />
                    <Bar dataKey="score">
                        {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.team_id === myTeamId ? "#ef4444" : "#3b82f6"}
                        />
                        ))}
                    </Bar>
                    {realMedian > 0 && (
                      <ReferenceLine
                          y={realMedian}
                          stroke="#ef4444"
                          strokeDasharray="3 3"
                          strokeWidth={2}
                          label={{ value: "Median", position: "right" }}
                      />
                    )}
                    </BarChart>

              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Rankings Table */}
        <Card className="flex flex-col">
            <CardHeader>
            <CardTitle>Week {selectedWeek} Team Rankings</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
            <div className="h-80 overflow-y-auto">
                <table className="w-full">
                <thead className="sticky top-0 bg-white border-b">
                    <tr>
                    <th className="text-left py-3 px-2">Rank</th>
                    <th className="text-left py-3 px-4">Team</th>
                    <th className="text-right py-3 px-4">Score</th>
                    <th className="text-right py-3 px-4">Difference</th>
                    </tr>
                </thead>
                <tbody>
                    {chartData.map((team, index) => {
                    const trend = getMedianTrend(team.score, realMedian)
                    const isIncludedInMedian = teamsToIncludeForLeagueMedianCalculation.includes(team.team_id)
                    return (
                        <tr key={team.team} className={`border-b hover:bg-gray-50 ${isIncludedInMedian ? 'bg-blue-50/30' : ''}`}>
                        <td className="py-3 px-2">
                            <Badge variant="secondary">
                            #{index + 1}
                            </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`${team.team_id === myTeamId ? 'font-bold text-black' : 'font-medium'}`}>
                              {team.team_name}
                            </span>
                            {isIncludedInMedian && (
                              <span className="text-xs text-blue-600">✓</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{team.score}</td>
                        <td className={`py-3 px-4 text-right font-mono ${realMedian > 0 ? trend.color : 'text-gray-400'}`}>
                            {realMedian > 0 ? trend.text : 'N/A'}
                        </td>
                        </tr>
                    )
                    })}
                </tbody>
                </table>
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}