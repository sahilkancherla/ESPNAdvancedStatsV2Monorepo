/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import { useState, JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter } from 'lucide-react'
import { useFantasyData } from '@/context/FantasyDataContext'
import { useNFLData } from '@/context/NFLDataContext'
import { DraftAnalysis } from './DraftAnalysis'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BigBoard } from './BigBoard'
import { MockDrafts } from './Mocks'


export function DraftAnalysisContent() {
  const {fantasyDraftPicks, fantasyTeams, fantasyPlayersSeasonStats} = useFantasyData()
  const {nflPlayers, nflTeams} = useNFLData()


  const getFantasyPlayerTotalSeasonPoints = (playerId: string): number | undefined => {
    const playerSeasonStats = fantasyPlayersSeasonStats.find(stat => stat.player_id === playerId)
    return playerSeasonStats?.total_points
  }

  const draftData: any[] = []
  for (const draftPick of fantasyDraftPicks) {
    const player = nflPlayers.find(player => player.id === draftPick.player_id)
    const fantasyTeam = fantasyTeams.find(team => team.id === draftPick.team_id)
    const nflTeam = nflTeams.find(team => team.id === player?.team_id)

    if (player) {
      draftData.push({
        ...draftPick,
        overallPick: (draftPick.round_number - 1) * fantasyTeams.length + draftPick.pick_number,
        player: player.first_name + ' ' + player.last_name,
        position: player.position,
        fantasyTeamName: fantasyTeam?.team_name,
        nflTeamName: nflTeam?.team_name,
      })
    }
  }

  // Calculate position rankings and draft position rankings
  const positionsData = draftData.reduce((acc, pick) => {
    if (!acc[pick.position]) {
      acc[pick.position] = []
    }
    acc[pick.position].push(pick)
    return acc
  }, {} as Record<string, typeof draftData>)

  const calculateSimpleHybridDifference = (draftPosition: number, finalOverallRank: number, finalPositionRank: number, positionDrafted: number) => {
    
    // How much better/worse than draft position overall
    const overallDiff = draftPosition - finalOverallRank;
    
    // How much better/worse than position drafted
    const positionDiff = positionDrafted - finalPositionRank;
    
    // Average them with slight positional weight
    const hybridScore = (overallDiff * 0.15) + (positionDiff * 0.85);
    
    return hybridScore;
  };

  // Add ranking fields to draft data
  const enrichedDraftData = draftData.map(pick => {
    const positionPlayers = positionsData[pick.position]
    
    // Sort by total season points (descending) for position rank
    const sortedByPoints = [...positionPlayers].sort((a, b) => {
      const aPoints = getFantasyPlayerTotalSeasonPoints(a.player_id) || 0
      const bPoints = getFantasyPlayerTotalSeasonPoints(b.player_id) || 0
      return bPoints - aPoints
    })
    
    // Sort all players by total season points for overall rank
    const allPlayersSortedByPoints = [...draftData].sort((a, b) => {
      const aPoints = getFantasyPlayerTotalSeasonPoints(a.player_id) || 0
      const bPoints = getFantasyPlayerTotalSeasonPoints(b.player_id) || 0
      return bPoints - aPoints
    })
    
    // Sort by draft position (ascending) for draft position rank
    const sortedByDraft = [...positionPlayers].sort((a, b) => a.overallPick - b.overallPick)
    
    const overallRank = allPlayersSortedByPoints.findIndex(p => p.id === pick.id) + 1
    const positionRank = sortedByPoints.findIndex(p => p.id === pick.id) + 1
    const draftPositionRank = sortedByDraft.findIndex(p => p.id === pick.id) + 1

    const rankDifference = draftPositionRank - positionRank
    
    const weightedRankDifference = calculateSimpleHybridDifference(pick.overallPick, overallRank, positionRank, draftPositionRank)
    
    return {
      ...pick,
      overallRank,
      positionRank,
      draftPositionRank,
      rankDifference,
      weightedRankDifference
    }
  })

  const getPositionBadgeStyle = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-red-50 text-red-700 border-red-200'
      case 'RB': return 'bg-green-50 text-green-700 border-green-200'
      case 'WR': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'TE': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'K': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'D/ST': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getRankDifferenceBadgeStyle = (rankDifference: number): JSX.Element | null => {

    if (Math.abs(rankDifference) < 3) {
      return <Badge style={{ backgroundColor: '#6b7280', color: 'white' }}>Even</Badge>
    } else if (rankDifference >= 3 && rankDifference < 5) {
      return <Badge style={{ backgroundColor: '#84cc16', color: 'white' }}>Good</Badge>
    } else if (rankDifference >= 5 && rankDifference < 10) {
      return <Badge style={{ backgroundColor: '#22c55e', color: 'white' }}>Steal</Badge>
    } else if (rankDifference >= 10 && rankDifference < 20) {
      return <Badge style={{ backgroundColor: '#16a34a', color: 'white' }}>Great Steal</Badge>
    } else if (rankDifference >= 20) {
      return <Badge style={{ backgroundColor: '#15803d', color: 'white' }}>Elite Steal</Badge>
    } else if (rankDifference <= -3 && rankDifference > -5) {
      return <Badge style={{ backgroundColor: '#f59e0b', color: 'white' }}>Reach</Badge>
    } else if (rankDifference <= -5 && rankDifference > -10) {
      return <Badge style={{ backgroundColor: '#ef4444', color: 'white' }}>Big Reach</Badge>
    } else if (rankDifference <= -10) {
      return <Badge style={{ backgroundColor: '#dc2626', color: 'white' }}>Major Bust</Badge>
    }
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Draft Board</h1>
          <p className="text-muted-foreground">2024 Fantasy Football Draft Results</p>
        </div>
      </div>


      {/* Tabs for Draft Analysis and Big Board */}
      <Tabs defaultValue="draft-analysis" className="w-full">
        <TabsList>
          <TabsTrigger value="draft-analysis">Draft Analysis</TabsTrigger>
          <TabsTrigger value="big-board">Big Board</TabsTrigger>
          <TabsTrigger value="mock-drafts">Mock Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="draft-analysis" className="pt-4">
          {enrichedDraftData.length > 0 && (
            <DraftAnalysis draftData={enrichedDraftData} getPositionBadgeStyle={getPositionBadgeStyle} getRankDifferenceBadgeStyle={getRankDifferenceBadgeStyle} getFantasyPlayerTotalSeasonPoints={getFantasyPlayerTotalSeasonPoints} />
          )}
        </TabsContent>

        <TabsContent value="big-board" className="pt-4">
          <BigBoard />
        </TabsContent>

        <TabsContent value="mock-drafts" className="pt-4">
          <MockDrafts />
        </TabsContent>
      </Tabs>
    </div>
  )
}