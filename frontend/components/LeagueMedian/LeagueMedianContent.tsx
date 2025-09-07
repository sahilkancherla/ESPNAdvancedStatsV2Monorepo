/* eslint-disable react-hooks/exhaustive-deps */

'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { Settings, Activity, Clock, RefreshCw } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'
import { useFantasyData } from '@/context/FantasyDataContext'


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

interface LivePointsData {
  id: string
  league_id: string
  team_id: string
  points: number
  week: number
  year: number
  created_at: string
}

interface LivePointsResponse {
  data: LivePointsData[]
}

export function LeagueMedianContent() {

  const { fantasyTeams } = useFantasyData()
  const { currentYear, currentWeek } = useUser()
  const { selectedLeagueId, myTeamId } = useLeagueTeamData()

  const [isActive, setIsActive] = useState(false)
  const [liveData, setLiveData] = useState<LivePointsData[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Check if all required data is available
  const hasRequiredData = Boolean(
    currentYear && 
    currentWeek && 
    selectedLeagueId && 
    fantasyTeams && 
    fantasyTeams.length > 0
  )

  // Initialize selectedTeams when fantasyTeams becomes available
  useEffect(() => {
    if (fantasyTeams && fantasyTeams.length > 0 && selectedTeams.length === 0) {
      setSelectedTeams(fantasyTeams.map(t => t.id))
    }
  }, [fantasyTeams, selectedTeams.length])

  // Configuration - only use if data is available
  const year = currentYear || new Date().getFullYear()
  const week = currentWeek || 1
  const leagueId = selectedLeagueId || ''

  // Check if we're in an active game window
  const checkActiveWindow = async () => {
    if (!BACKEND_URL || !year || !week) {
      return false
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/admin/isInsideActiveGameTimeWindow?year=${year}&week=${week}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const isActiveWindow = Boolean(data?.isInsideWindow)
      setIsActive(isActiveWindow)
      return isActiveWindow
    } catch (error) {
      console.error('Error checking active window:', error)
      setError('Failed to check game window status')
      return false
    }
  }

  // Fetch live points data
  const fetchLiveData = async () => {
    if (!BACKEND_URL || !year || !leagueId || !week) {
      setError('Missing required configuration')
      return
    }

    try {
      setError(null)
      const response = await fetch(`${BACKEND_URL}/league/getLiveLatestPoints?year=${year}&leagueId=${leagueId}&week=${week}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: LivePointsResponse = await response.json()
      setLiveData(data?.data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching live data:', error)
      setError('Failed to fetch live data')
      setLiveData([])
    }
  }

  // Initial load and setup polling
  useEffect(() => {
    if (!hasRequiredData || initialized) {
      return
    }

    const initialize = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const active = await checkActiveWindow()
        if (active) {
          await fetchLiveData()
        }
        setInitialized(true)
      } catch (error) {
        console.error('Initialization error:', error)
        setError('Failed to initialize live tracker')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [hasRequiredData, initialized])

  // Set up polling interval
  useEffect(() => {
    if (!initialized || !hasRequiredData) {
      return
    }

    // Set up polling every 30 seconds if active
    const interval = setInterval(async () => {
      try {
        const active = await checkActiveWindow()
        if (active) {
          await fetchLiveData()
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [initialized, hasRequiredData])

  // Calculate median score
  const calculateMedian = () => {
    if (!liveData || liveData.length === 0 || !selectedTeams || selectedTeams.length === 0) {
      return 0
    }

    const filteredData = liveData.filter(item => 
      item && 
      item.team_id && 
      selectedTeams.includes(item.team_id) &&
      typeof item.points === 'number' &&
      !isNaN(item.points)
    )
    
    if (filteredData.length === 0) return 0

    const scores = filteredData.map(item => item.points).sort((a, b) => a - b)
    const median = scores.length % 2 === 0 
      ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
      : scores[Math.floor(scores.length / 2)]
    return parseFloat(median.toFixed(2))
  }

  // Prepare chart data
  const chartData = (liveData || [])
    .filter(item => item && typeof item.points === 'number' && !isNaN(item.points))
    .sort((a, b) => b.points - a.points)
    .map((item, index) => {
      const team = (fantasyTeams || []).find(t => t && t.id === item.team_id)
      return {
        team_id: item.team_id || 'unknown',
        team: team?.team_abbrev || 'UNK',
        team_name: team?.team_name || 'Unknown Team',
        score: item.points || 0,
        rank: index + 1
      }
    })

  const median = calculateMedian()
  const myScore = (liveData || []).find(item => item && item.team_id === myTeamId)?.points || 0
  const scores = (liveData || []).map(item => item?.points || 0).filter(score => !isNaN(score))
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  // Show loading state if required data is not available
  if (!hasRequiredData) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-muted-foreground">Loading required data...</p>
            <p className="text-sm text-gray-500">
              Waiting for league, team, and user data to load
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-muted-foreground">Checking live game status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isActive) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <Clock className="h-16 w-16 text-gray-400 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-600">No Active Games</h3>
            <p className="text-muted-foreground">
              Live tracking is only available during active game windows.
            </p>
            <p className="text-sm text-gray-500">
              Week {week}, {year} • League: {leagueId}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await fetchLiveData()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold">Live League Median Tracker</h1>
          </div>
          <Badge variant="default" className="bg-green-500">
            LIVE
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>
              Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Teams ({selectedTeams?.length || 0})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Teams for Median Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      Select which teams to include in the live median calculation
                    </p>
                  </div>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {(fantasyTeams || []).map((team) => {
                      if (!team || !team.id) return null
                      return (
                        <div key={team.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={team.id}
                            checked={selectedTeams?.includes(team.id) || false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTeams(prev => [...(prev || []), team.id])
                              } else {
                                setSelectedTeams(prev => (prev || []).filter(id => id !== team.id))
                              }
                            }}
                          />
                          <label
                            htmlFor={team.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {team.team_name || 'Unknown Team'}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTeams((fantasyTeams || []).map(t => t?.id).filter(Boolean))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTeams([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <p className="font-medium">Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Live Median</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {(!selectedTeams || selectedTeams.length === 0) ? 'N/A' : median.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Week {week} ({selectedTeams?.length || 0} teams)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{myScore.toFixed(2)}</div>
            {median > 0 && (
              <p className={`text-xs ${myScore > median ? 'text-green-600' : 'text-red-600'}`}>
                {myScore > median ? '+' : ''}{(myScore - median).toFixed(1)} vs Median
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{highestScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground truncate">
              {chartData.find(t => t.score === highestScore)?.team_name || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{lowestScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground truncate">
              {chartData.find(t => t.score === lowestScore)?.team_name || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {(!selectedTeams || selectedTeams.length === 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <p className="font-medium">No teams selected for median calculation</p>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Please select at least one team using the &quot;Teams&quot; button above to calculate the live median.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Live Scores Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Live Team Scores - Week {week}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No live data available</p>
              </div>
            ) : (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="team" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                      interval={0}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          if (!data) return null;
                          
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-xs">
                              <p className="font-semibold text-sm">{data.team_name || 'Unknown Team'}</p>
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="text-blue-600 text-sm">
                                Live Score: <span className="font-mono">{(data.score || 0).toFixed(2)}</span>
                              </p>
                              <p className="text-gray-600 text-sm">Rank: #{data.rank || 'N/A'}</p>
                              {median > 0 && (
                                <p
                                  className={`text-sm ${
                                    (data.score || 0) > median ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  vs Median:{" "}
                                  {(data.score || 0) > median ? "+" : ""}
                                  {((data.score || 0) - median).toFixed(1)}
                                </p>
                              )}
                              {selectedTeams?.includes(data.team_id) && (
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
                    {median > 0 && (
                      <ReferenceLine
                        y={median}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        label={{ value: "Live Median", position: "right", fontSize: 12 }}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Rankings Table */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Live Team Rankings - Week {week}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-0 sm:px-6">
            {chartData.length === 0 ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No live data available</p>
              </div>
            ) : (
              <div className="h-64 sm:h-80 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="sticky top-0 bg-white border-b">
                      <tr>
                        <th className="text-left py-3 px-2 sm:px-2 text-sm">Rank</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-sm">Team</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-sm">Live Score</th>
                        <th className="text-right py-3 px-2 sm:px-4 text-sm">vs Median</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((team, index) => {
                        if (!team) return null;
                        const diff = (team.score || 0) - median
                        const isIncluded = selectedTeams?.includes(team.team_id) || false
                        return (
                          <tr key={team.team_id || index} className={`border-b hover:bg-gray-50 ${isIncluded ? 'bg-blue-50/30' : ''}`}>
                            <td className="py-3 px-2 sm:px-2">
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className={`text-xs sm:text-sm ${team.team_id === myTeamId ? 'font-bold text-black' : 'font-medium'} truncate max-w-[120px] sm:max-w-none`}>
                                  {team.team_name || 'Unknown Team'}
                                </span>
                                {isIncluded && (
                                  <span className="text-xs text-blue-600 flex-shrink-0">✓</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-right font-mono text-xs sm:text-sm font-semibold">
                              {(team.score || 0).toFixed(2)}
                            </td>
                            <td className={`py-3 px-2 sm:px-4 text-right font-mono text-xs sm:text-sm ${median > 0 ? (diff >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                              {median > 0 ? (diff >= 0 ? '+' : '') + diff.toFixed(1) : 'N/A'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}