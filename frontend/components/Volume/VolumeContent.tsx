/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Activity, Target, Timer, TrendingUp, Users, ArrowUpDown, Search, Eye, Zap, Clock } from 'lucide-react'

// Filler data
const weeks = Array.from({ length: 17 }, (_, i) => i + 1)

const rushingVolumeData = [
  { player: "Christian McCaffrey", team: "SF", carries: 287, yards: 1459, td: 14, snapShare: 78.2, teamShare: 64.5 },
  { player: "Josh Jacobs", team: "LV", carries: 340, yards: 1653, td: 12, snapShare: 82.1, teamShare: 71.3 },
  { player: "Saquon Barkley", team: "NYG", carries: 295, yards: 1312, td: 10, snapShare: 69.8, teamShare: 68.2 },
  { player: "Tony Pollard", team: "DAL", carries: 262, yards: 1007, td: 9, snapShare: 65.4, teamShare: 58.7 },
  { player: "Nick Chubb", team: "CLE", carries: 259, yards: 1525, td: 12, snapShare: 79.3, teamShare: 72.1 },
  { player: "Derrick Henry", team: "TEN", carries: 349, yards: 1538, td: 13, snapShare: 74.6, teamShare: 75.2 },
  { player: "Austin Ekeler", team: "LAC", carries: 204, yards: 915, td: 5, snapShare: 68.9, teamShare: 52.8 },
  { player: "Aaron Jones", team: "GB", carries: 228, yards: 1121, td: 7, snapShare: 71.2, teamShare: 59.3 }
]

const receivingVolumeData = [
  { player: "Davante Adams", team: "LV", targets: 180, receptions: 100, yards: 1516, td: 14, snapShare: 89.4, teamShare: 28.7, airYards: 1892 },
  { player: "Tyreek Hill", team: "MIA", targets: 170, receptions: 119, yards: 1710, td: 7, snapShare: 87.2, teamShare: 31.2, airYards: 1654 },
  { player: "Stefon Diggs", team: "BUF", targets: 154, receptions: 108, yards: 1429, td: 11, snapShare: 85.1, teamShare: 26.8, airYards: 1723 },
  { player: "Cooper Kupp", team: "LAR", targets: 145, receptions: 92, yards: 812, td: 3, snapShare: 82.6, teamShare: 27.9, airYards: 1012 },
  { player: "Amon-Ra St. Brown", team: "DET", targets: 149, receptions: 106, yards: 1515, td: 6, snapShare: 79.8, teamShare: 25.4, airYards: 1234 },
  { player: "DeAndre Hopkins", team: "ARI", targets: 140, receptions: 64, yards: 717, td: 3, snapShare: 88.1, teamShare: 29.8, airYards: 1456 },
  { player: "A.J. Brown", team: "PHI", targets: 145, receptions: 88, yards: 1496, td: 11, snapShare: 86.3, teamShare: 28.2, airYards: 1687 },
  { player: "Mike Evans", team: "TB", targets: 124, receptions: 71, yards: 1124, td: 5, snapShare: 84.7, teamShare: 24.1, airYards: 1598 }
]

const teamVolumeData = [
  { team: "MIA", rushAttempts: 387, passAttempts: 544, totalPlays: 931, pace: 28.4, snapCount: 1089 },
  { team: "BUF", rushAttempts: 421, passAttempts: 578, totalPlays: 999, pace: 26.8, snapCount: 1124 },
  { team: "PHI", rushAttempts: 514, passAttempts: 515, totalPlays: 1029, pace: 27.1, snapCount: 1156 },
  { team: "KC", rushAttempts: 456, passAttempts: 567, totalPlays: 1023, pace: 25.9, snapCount: 1087 },
  { team: "SF", rushAttempts: 445, passAttempts: 523, totalPlays: 968, pace: 26.2, snapCount: 1034 },
  { team: "DAL", rushAttempts: 446, passAttempts: 556, totalPlays: 1002, pace: 27.6, snapCount: 1098 },
  { team: "LV", rushAttempts: 451, passAttempts: 489, totalPlays: 940, pace: 29.1, snapCount: 1012 },
  { team: "TEN", rushAttempts: 464, passAttempts: 398, totalPlays: 862, pace: 30.2, snapCount: 945 }
]

const snapShareData = [
  { position: "RB1", averageSnaps: 68.2, color: "#22c55e" },
  { position: "RB2", averageSnaps: 28.4, color: "#84cc16" },
  { position: "WR1", averageSnaps: 87.6, color: "#3b82f6" },
  { position: "WR2", averageSnaps: 76.3, color: "#6366f1" },
  { position: "WR3", averageSnaps: 51.2, color: "#8b5cf6" },
  { position: "TE1", averageSnaps: 72.8, color: "#f59e0b" },
  { position: "QB", averageSnaps: 98.1, color: "#ef4444" }
]

export function VolumeContent() {
  const [selectedWeek, setSelectedWeek] = useState('season')
  const [viewMode, setViewMode] = useState<'players' | 'teams'>('players')
  const [positionFilter, setPositionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRushingData = rushingVolumeData.filter(player => 
    searchTerm === '' || player.player.toLowerCase().includes(searchTerm.toLowerCase()) || 
    player.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredReceivingData = receivingVolumeData.filter(player => 
    searchTerm === '' || player.player.toLowerCase().includes(searchTerm.toLowerCase()) || 
    player.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeamData = teamVolumeData.filter(team => 
    searchTerm === '' || team.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NFL Volume Analysis</h1>
          <p className="text-muted-foreground">Track snap counts, target share, and usage patterns across the league</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="season">Season</SelectItem>
              {weeks.map(week => (
                <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="rb">RB</SelectItem>
              <SelectItem value="wr">WR</SelectItem>
              <SelectItem value="te">TE</SelectItem>
              <SelectItem value="qb">QB</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex bg-muted rounded-md p-1">
            <Button 
              variant={viewMode === 'players' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('players')}
            >
              Players
            </Button>
            <Button 
              variant={viewMode === 'teams' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('teams')}
            >
              Teams
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}