/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'
import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Clock, Trophy, Zap, Target, TrendingUp, Loader2, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNFLData } from '@/context/NFLDataContext'
import { useUser } from '@/context/UserContext'
import { useFantasyData } from '@/context/FantasyDataContext'
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

interface LiveData {
  id: string
  time: string
  points: number
  team_id: string
}

interface NFLBigPlay {
  id: string
  player_id: string
  description: string
  timestamp: string
  week: number
  year: number
}

// Team colors for chart lines
const teamColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
]

export function LiveTrackingContent() {
  const { currentYear } = useUser()
  const { nflBigPlays, nflPlayers, nflTeams } = useNFLData()
  const { fantasyTeams, fantasyPlayersWeeklyStats, isLoading } = useFantasyData()
  const { selectedLeagueId, leagues } = useLeagueTeamData()
  
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId)
  const myTeam = selectedLeague?.teams.find(team => team.id === selectedLeague?.teamId)
  const myTeamId = myTeam?.id

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [liveData, setLiveData] = useState<LiveData[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>([])
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(false)
  const [selectedPlay, setSelectedPlay] = useState<NFLBigPlay | null>(null)

  // Get available fantasy teams for the league
  const availableTeams = useMemo(() => {
    if (!selectedLeague) return []
    return selectedLeague.teams || []
  }, [selectedLeague])

  // Set initial selected teams when teams are available
  useEffect(() => {
    if (availableTeams.length > 0 && selectedTeams.length === 0) {
      const initialTeams = availableTeams.map(team => team.id)
      setSelectedTeams(initialTeams)
      setTempSelectedTeams(initialTeams)
    }
  }, [availableTeams, selectedTeams.length])

  const convertToLocalTime = (time: string) => {
    const date = new Date(time)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Fetch live data when week or year changes
  useEffect(() => {
    const fetchLiveData = async () => {
      if (!selectedWeek || !currentYear || !selectedLeagueId) return
      
      setIsLoadingLiveData(true)
      try {
        const response = await fetch(`${BACKEND_URL}/league/getPointHistory?week=${selectedWeek}&year=${currentYear}&leagueId=${selectedLeagueId}`)
        if (response.ok) {
          const data = await response.json()
          console.log('data.data', data.data)

          const cleanedLiveData = []
          for (const item of data.data) {

            cleanedLiveData.push({
              id: item.id.toString(),
              time: convertToLocalTime(item.created_at.toString()),
              points: item.points.toFixed(2),
              team_id: item.team_id.toString()
            })
          }
          setLiveData(cleanedLiveData)
        } else {
          console.error('Failed to fetch live data:', response.statusText)
          setLiveData([])
        }
      } catch (error) {
        console.error('Error fetching live data:', error)
        setLiveData([])
      } finally {
        setIsLoadingLiveData(false)
      }
    }

    fetchLiveData()
  }, [selectedWeek, currentYear, selectedLeagueId])

  const getNFLTeamAbbrev = (teamId: string) => {
    if (!teamId) return 'N/A'
    const team = nflTeams.find(t => t.id === teamId)
    return team?.team_abbrev
  }

  const getNFLTeamName = (teamId: string | undefined) => {

    if (!teamId) return 'Unknown Team'
    const team = nflTeams.find(t => t.id === teamId)
    return team?.team_name
  }
  // Filter big plays for selected teams and week
  const relevantBigPlays = useMemo(() => {
    if (!selectedTeams.length) return []
    
    const allBigPlays = nflBigPlays.filter(
      bigPlay => bigPlay.week === selectedWeek && bigPlay.year === currentYear
    )

    // Get player IDs for selected teams
    const selectedTeamPlayerIds = selectedTeams.flatMap(teamId => {
      const teamStats = fantasyPlayersWeeklyStats.filter(
        stat => stat.team_id === teamId && stat.week === selectedWeek
      )
      return teamStats.map(stat => stat.player_id)
    })

    return allBigPlays.filter(bigPlay => 
      selectedTeamPlayerIds.includes(bigPlay.player_id)
    )
  }, [selectedTeams, selectedWeek, currentYear, nflBigPlays, fantasyPlayersWeeklyStats])

  // Format any ISO UTC timestamp to user's local timezone
  const formatTimestamp = (timestamp: string) => {
    console.log("Input timestamp:", timestamp);

    try {
      // Construct date directly; JS Date parses ISO 8601 with offsets correctly
      const date = new Date(timestamp);

      if (isNaN(date.getTime())) throw new Error("Invalid timestamp");

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return {
        time: date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          timeZone: userTimezone,
          timeZoneName: "short",
        }),
        date: date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: userTimezone,
        }),
      };
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return { time: "Invalid time", date: "" };
    }
  };

  


  // Get player and team info for a big play
  const getPlayPlayerInfo = (play: NFLBigPlay) => {
    const player = nflPlayers.find(p => p.id === play.player_id)
    
    // Find which fantasy team owns this player
    const playerStats = fantasyPlayersWeeklyStats.find(
      stat => stat.player_id === play.player_id && stat.week === selectedWeek
    )
    const fantasyTeam = availableTeams.find(team => team.id === playerStats?.team_id)
    
    return {
      player,
      fantasyTeam,
      playerStats
    }
  }
  const getPlayTypeDetails = (description: string) => {
    if (description.toLowerCase().includes('touchdown')) {
      return { 
        icon: Trophy, 
        color: 'text-yellow-600 bg-yellow-100', 
        textColor: 'text-yellow-800',
        type: 'Touchdown'
      }
    } else if (description.toLowerCase().includes('rushing')) {
      return { 
        icon: TrendingUp, 
        color: 'text-green-600 bg-green-100', 
        textColor: 'text-green-800',
        type: 'Big Rush'
      }
    } else if (description.toLowerCase().includes('passing') || description.toLowerCase().includes('receiving')) {
      return { 
        icon: Target, 
        color: 'text-blue-600 bg-blue-100', 
        textColor: 'text-blue-800',
        type: 'Big Pass'
      }
    }
    return { 
      icon: Zap, 
      color: 'text-purple-600 bg-purple-100', 
      textColor: 'text-purple-800',
      type: 'Big Play'
    }
  }

  // Sort big plays by timestamp (most recent first)
  const sortedBigPlays = useMemo(() => {
    return [...relevantBigPlays].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [relevantBigPlays])

  // Group big plays by date
  const groupedBigPlays = useMemo(() => {
    const groups = sortedBigPlays.reduce((acc, play) => {
      const date = new Date(play.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(play)
      return acc
    }, {} as Record<string, NFLBigPlay[]>)

    return Object.entries(groups)
  }, [sortedBigPlays])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!liveData.length || !selectedTeams.length) return []

    console.log('liveData in chartData', liveData)

    // Group live data by time
    const timeGroups = liveData.reduce((acc, item) => {
      if (!acc[item.time]) {
        acc[item.time] = { time: item.time }
      }
      
      // Only include data for selected teams
      if (selectedTeams.includes(item.team_id)) {
        const team = availableTeams.find(t => t.id === item.team_id)
        if (team) {
          acc[item.time][team.team_name] = item.points
        }
      }
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(timeGroups).sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    )
  }, [liveData, selectedTeams, availableTeams])

  console.log('chartData', chartData)

  const handleTeamToggle = (teamId: string) => {
    setTempSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(t => t !== teamId)
        : [...prev, teamId]
    )
  }

  const applyTeamSelection = () => {
    setSelectedTeams(tempSelectedTeams)
    setIsDialogOpen(false)
  }

  const cancelTeamSelection = () => {
    setTempSelectedTeams(selectedTeams)
    setIsDialogOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fantasy Football Live Tracker</h1>
          <p className="text-muted-foreground">Track your fantasy teams&apos; point progression and big plays throughout the week</p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Week Selector */}
            <div className="flex items-center gap-2">
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 18 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Week {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Selection Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  Select Teams ({selectedTeams.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Teams to Track</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {availableTeams.map((team, index) => (
                    <div key={team.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={tempSelectedTeams.includes(team.id)}
                        onCheckedChange={() => handleTeamToggle(team.id)}
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: teamColors[index % teamColors.length] }}
                        />
                        <span className="text-sm">{team.team_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={cancelTeamSelection}>
                    Cancel
                  </Button>
                  <Button onClick={applyTeamSelection}>
                    Apply
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Selected Teams Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedTeams.map((teamId) => {
              const team = availableTeams.find(t => t.id === teamId)
              const teamIndex = availableTeams.findIndex(t => t.id === teamId)
              
              return team ? (
                <Badge 
                  key={teamId}
                  className="text-white"
                  style={{ backgroundColor: teamColors[teamIndex % teamColors.length] }}
                >
                  {team.team_name}
                </Badge>
              ) : null
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Point Progression
                {isLoadingLiveData && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {isLoadingLiveData ? "Loading live data..." : "No live data available for this week"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <Card className="p-3 shadow-lg">
                                <CardContent className="p-0">
                                  <p className="font-medium mb-2">{`Time: ${label}`}</p>
                                  {payload.map((entry, index) => (
                                    <p key={index} style={{ color: entry.color }}>
                                      {`${entry.dataKey}: ${entry.value} pts`}
                                    </p>
                                  ))}
                                </CardContent>
                              </Card>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      {selectedTeams.map((teamId, index) => {
                        const team = availableTeams.find(t => t.id === teamId)
                        if (!team) return null
                        
                        return (
                          <Line
                            key={teamId}
                            type="monotone"
                            dataKey={team.team_name}
                            stroke={teamColors[index % teamColors.length]}
                            strokeWidth={3}
                            dot={{ fill: teamColors[index % teamColors.length], strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        )
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Big Plays Timeline - Takes up 1 column on large screens */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Big Plays Timeline
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Week {selectedWeek}, {currentYear} • {relevantBigPlays.length} plays
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {groupedBigPlays.length === 0 ? (
                  <div className="p-6 text-center">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedTeams.length === 0 
                        ? "Select teams to view their big plays" 
                        : "No big plays recorded yet for selected teams"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {groupedBigPlays.map(([date, plays]) => (
                      <div key={date} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{date}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {plays.length} plays
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                          {plays.map((play) => {
                            const playDetails = getPlayTypeDetails(play.description)
                            const timeInfo = formatTimestamp(play.timestamp)
                            const PlayIcon = playDetails.icon
                            const { player, fantasyTeam } = getPlayPlayerInfo(play)
                            
                            return (
                              <div 
                                key={play.id} 
                                className="relative cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                onClick={() => setSelectedPlay(play)}
                              >
                                <div className="absolute -left-6 top-3">
                                  <div className={`p-1.5 rounded-full ${playDetails.color}`}>
                                    <PlayIcon className="h-3 w-3" />
                                  </div>
                                </div>
                                
                                <div className="ml-2 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={`text-xs ${playDetails.textColor} border-current`}>
                                      {playDetails.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {timeInfo.time}
                                    </span>
                                  </div>
                                  
                                  {/* Player Info Row */}
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage 
                                        src="" 
                                        alt={player?.first_name + ' ' + player?.last_name || 'Player'} 
                                      />
                                      <AvatarFallback className="text-xs">
                                        <User className="h-3 w-3" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium truncate">
                                          {player?.first_name + ' ' + player?.last_name || 'Unknown Player'}
                                        </span>
                                        {fantasyTeam && (
                                          <Badge variant="secondary" className="text-xs px-1 py-0">
                                            {fantasyTeam.team_name}
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {player?.position} • {getNFLTeamAbbrev(player?.team_id || '')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm leading-tight">
                                    {play.description}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        {date !== groupedBigPlays[groupedBigPlays.length - 1][0] && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Play Details Dialog */}
      <Dialog open={!!selectedPlay} onOpenChange={() => setSelectedPlay(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlay && (() => {
                const playDetails = getPlayTypeDetails(selectedPlay.description)
                const PlayIcon = playDetails.icon
                return (
                  <>
                    <div className={`p-2 rounded-full ${playDetails.color}`}>
                      <PlayIcon className="h-4 w-4" />
                    </div>
                    {playDetails.type} Details
                  </>
                )
              })()}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlay && (() => {
            const { player, fantasyTeam, playerStats } = getPlayPlayerInfo(selectedPlay)
            const timeInfo = formatTimestamp(selectedPlay.timestamp)
            
            return (
              <div className="space-y-6">
                {/* Player Info Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src="" 
                      alt={player?.first_name + ' ' + player?.last_name || 'Player'} 
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {player?.first_name + ' ' + player?.last_name || 'Unknown Player'}
                    </h3>
                    <p className="text-muted-foreground">
                      {player?.position} • {getNFLTeamName(player?.team_id)}
                    </p>
                    {fantasyTeam && (
                      <Badge className="mt-1" style={{ 
                        backgroundColor: teamColors[availableTeams.findIndex(t => t.id === fantasyTeam.id) % teamColors.length] 
                      }}>
                        {fantasyTeam.team_name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Play Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Play Description</h4>
                    <p className="text-sm bg-muted p-3 rounded-lg">
                      {selectedPlay.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Time</h4>
                      <p className="text-sm text-muted-foreground">
                        {timeInfo.date} at {timeInfo.time}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Week</h4>
                      <p className="text-sm text-muted-foreground">
                        Week {selectedPlay.week}, {selectedPlay.year}
                      </p>
                    </div>
                  </div>

                  {playerStats && (
                    <div>
                      <h4 className="font-semibold mb-2">Weekly Stats</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{playerStats.actual_fantasy_points || 0}</div>
                          <div className="text-xs text-muted-foreground">Fantasy Points</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{playerStats.actual_fantasy_points || 0}</div>
                          <div className="text-xs text-muted-foreground">Yards</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{playerStats.actual_fantasy_points || 0}</div>
                          <div className="text-xs text-muted-foreground">TDs</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}