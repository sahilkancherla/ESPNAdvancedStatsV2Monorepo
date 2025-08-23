'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { BigBoardPlayer } from '@/lib/interfaces'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EditBigBoardModal } from '@/components/Draft/EditBigBoardModal'
import { Button } from '@/components/ui/button'
import BigBoardPlayerComponent from './BigBoardPlayer'
import { Edit } from "lucide-react"
import { useNFLData } from '@/context/NFLDataContext'
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const positionsOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST']

export function BigBoard() {
  const { nflPlayers } = useNFLData()
  const { selectedLeagueId, leagues } = useLeagueTeamData()
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId);
  const teamId = selectedLeague?.teamId;

  const [isOpen, setIsOpen] = useState(false)
  const [bigBoard, setBigBoard] = useState<BigBoardPlayer[]>([]) // Fixed type
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("by-position")

  // const [visiblePositions, setVisiblePositions] = useState<string[]>(positionsOrder)

  // const togglePosition = (pos: string) => {
  //   setVisiblePositions(prev =>
  //     prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
  //   )
  // }
  
  const handleModalClose = () => {
    setIsOpen(false)
    getBigBoard(activeTab) // Refresh data after modal closes
  }

  const getBigBoard = useCallback(async (tab?: string) => {
    if (tab) setActiveTab(tab)
    
    // Don't fetch if teamId is not available
    if (!teamId) {
      setError('No team selected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${BACKEND_URL}/team/getBigBoard?teamId=${teamId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.nflPlayers && Array.isArray(data.nflPlayers)) {
        // Sort and limit players
        const sortedPlayers = data.nflPlayers
          .sort((a: BigBoardPlayer, b: BigBoardPlayer) => (a.rank || 0) - (b.rank || 0))
          .slice(0, 250)

        const nflBigBoardPlayers: BigBoardPlayer[] = []

        for (const player of sortedPlayers) {
          const nflPlayer = nflPlayers.find(p => p.id === player.nfl_player_id);
          if (nflPlayer) {
            nflBigBoardPlayers.push({
              ...nflPlayer,
              big_board_id: player.id, 
              rank: player.rank || 0,
              tier: player.tier || 1,
              label: player.label || '',
              drafted: player.drafted || false,
              notes: player.notes || '',
            });
          }
        }

        setBigBoard(nflBigBoardPlayers);
      } else {
        setError(data.error || 'No players data received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error loading big board'
      setError(errorMessage)
      console.error('BigBoard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [teamId, nflPlayers])

  useEffect(() => {
    if (teamId && nflPlayers.length > 0) {
      getBigBoard()
    }
  }, [teamId, nflPlayers, getBigBoard])

  // Group players by position with proper typing
  const playersByPosition = bigBoard.reduce<Record<string, BigBoardPlayer[]>>((acc, player) => {
    if (!acc[player.position]) acc[player.position] = []
    acc[player.position].push(player)
    return acc
  }, {})

  const onDraftToggle = async (playerId: string, isDrafted: boolean) => {
    // Optimistically update the UI
    setBigBoard(prev => prev.map(player => 
      player.id === playerId ? { ...player, drafted: isDrafted } : player
    ))

    try {
      const response = await fetch(`${BACKEND_URL}/league/updateBigBoardPlayerDraftStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: playerId,
          drafted: isDrafted
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update draft status')
      }
      console.log('Draft status updated successfully')
    } catch (error) {
      console.error('Error updating draft status:', error)
      // Revert the optimistic update
      setBigBoard(prev => prev.map(player => 
        player.id === playerId ? { ...player, drafted: !isDrafted } : player
      ))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col min-h-0">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading big board...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col min-h-0">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <Button onClick={() => getBigBoard()} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Big Board</CardTitle>
            <Button 
              onClick={() => setIsOpen(true)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 flex-shrink-0 ml-2"
            >
              <Edit className="h-3 w-3" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>

          <EditBigBoardModal
            isOpen={isOpen}
            onClose={handleModalClose}
            teamId={teamId as string}
            nflPlayers={nflPlayers}
            bigBoard={bigBoard}
          />
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 p-4 pt-0">
          {bigBoard.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
                <TabsTrigger value="by-position" className="text-xs">By Position</TabsTrigger>
                <TabsTrigger value="overall" className="text-xs">Overall</TabsTrigger>
              </TabsList>

              <TabsContent value="by-position" className="flex-1 min-h-0 mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 h-full">
                  {positionsOrder.map((pos) => (
                    <div key={pos} className="flex flex-col min-h-0">
                      <div className="flex-shrink-0 mb-2">
                        <Badge variant="secondary" className="w-full justify-center text-xs font-medium">
                          {pos} ({(playersByPosition[pos] ?? []).length})
                        </Badge>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="space-y-1">
                          {(playersByPosition[pos] ?? []).map((p, idx) => (
                            <div
                              key={`${p.id}-${p.big_board_id}`}
                              className="text-xs p-1 rounded bg-muted/50 hover:bg-muted transition-colors"
                              title={`#${idx + 1} ${p.first_name} ${p.last_name}`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground font-mono w-4 flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <BigBoardPlayerComponent 
                                    bigBoardPlayer={p} 
                                    onDraftToggle={onDraftToggle} 
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="overall" className="flex-1 min-h-0 mt-0">
                <div className="h-full overflow-y-auto">
                  <div className="space-y-1">
                    {bigBoard.map((player, idx) => (
                      <div
                        key={`${player.id}-${player.big_board_id}`}
                        className="flex items-center gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-sm"
                        title={`${player.first_name} ${player.last_name} - ${player.position}`}
                      >
                        <Badge variant="outline" className="font-mono text-xs w-8 h-6 flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <BigBoardPlayerComponent 
                            bigBoardPlayer={player} 
                            onDraftToggle={onDraftToggle} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No players in big board</p>
                <p className="text-xs mt-1">Click Edit to add players</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}