/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */

'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit, FileText, Plus, Folder, Search, Clock, ChevronLeft, ChevronRight, X, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import { useLeagueTeamData } from '@/context/LeagueTeamDataContext'
import { useNFLData } from '@/context/NFLDataContext'
import { useFantasyData } from '@/context/FantasyDataContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { FantasyMockDraft, FantasyMockDraftPick, NFLPlayer } from '@/lib/interfaces'

export function MockDrafts() {

  const {fantasyTeams} = useFantasyData()
  const {nflPlayers, nflTeams} = useNFLData()
  const { selectedLeagueId, leagues } = useLeagueTeamData()
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId);
  const allTeams = selectedLeague?.teams.map(team => team.id) || [];
  const teamId = selectedLeague?.teamId;

  const [selectedDraft, setSelectedDraft] = useState<FantasyMockDraft | null>(null)
  const [draftFiles, setDraftFiles] = useState<FantasyMockDraft[]>([])
  const [currentDraftPicks, setCurrentDraftPicks] = useState<FantasyMockDraftPick[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [playerSearchQuery, setPlayerSearchQuery] = useState('')
  const [selectedPick, setSelectedPick] = useState<FantasyMockDraftPick | null>(null)
  const [isSnakeDraft, setIsSnakeDraft] = useState(true)
  const [pickOrder, setPickOrder] = useState<string[]>(allTeams)
  const [loading, setLoading] = useState(false)
  const [picksLoading, setPicksLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [playerFilter, setPlayerFilter] = useState('ALL')
  const [showDraftedPlayers, setShowDraftedPlayers] = useState(false)
  const [viewingTeamRoster, setViewingTeamRoster] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<FantasyMockDraftPick | null>(null)
  const [activeTab, setActiveTab] = useState('draft')
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [deletingDraft, setDeletingDraft] = useState<string | null>(null)

  // New draft form state
  const [newDraft, setNewDraft] = useState({
    name: '',
    description: '',
    rounds: 7,
  })

  // Effect to handle sidebar and player selection mutual exclusion
  useEffect(() => {
    if (selectedPick && !sidebarCollapsed) {
      setSidebarCollapsed(true)
    }
  }, [selectedPick, sidebarCollapsed])

  useEffect(() => {
    if (!sidebarCollapsed && selectedPick) {
      setSelectedPick(null)
    }
  }, [sidebarCollapsed, selectedPick])

  const getMockDrafts = async () => {
    if (!selectedLeagueId || !teamId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/getFantasyMockDrafts?leagueId=${selectedLeagueId}&teamId=${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error fetching mock drafts:', data.error)
        return
      }
      
      const mockDrafts: FantasyMockDraft[] = data.data.map((draft: any) => ({
        id: draft.id,
        league_id: draft.league_id,
        team_id: draft.team_id,
        title: draft.title,
        description: draft.description,
        rounds: draft.rounds,
        created_at: draft.created_at,
        updated_at: draft.updated_at
      }))
      
      setDraftFiles(mockDrafts)
    } catch (error) {
      console.error('Error fetching mock drafts:', error)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getMockDrafts()
  }, [selectedLeagueId, teamId])

  const getMockDraftPicks = async (draftId: string) => {
    setPicksLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/getFantasyMockDraftPicks?mockDraftId=${draftId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      const picks: FantasyMockDraftPick[] = data.data.map((pick: any) => ({
        id: pick.id,
        fantasy_mock_draft_id: pick.fantasy_mock_draft_id,
        round_number: pick.round_number,
        pick_number: pick.pick_number,
        overall_pick: pick.overall_pick,
        drafting_team_id: pick.drafting_team_id,
        player_id: pick.player_id,
        notes: pick.notes || ''
      }))

      setCurrentDraftPicks(picks)
    } catch (error) {
      console.error('Error fetching mock draft picks:', error)
    } finally {
      setPicksLoading(false)
    }
  }

  const handleDraftSelect = (draft: FantasyMockDraft) => {
    setSelectedDraft(draft)
    setSelectedPick(null) // Clear any selected pick when changing drafts
    setActiveTab('draft') // Reset to draft tab when selecting a new draft
  }

  useEffect(() => {
    if (selectedDraft) {
      getMockDraftPicks(selectedDraft.id)
    } else {
      setCurrentDraftPicks([])
    }
  }, [selectedDraft])

  const handleCreateDraft = async () => {
    if (!selectedLeagueId || !teamId || !allTeams.length) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/createFantasyMockDraft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          leagueId: selectedLeagueId, 
          teamId: teamId, 
          isSnakeDraft: isSnakeDraft, 
          rounds: newDraft.rounds, 
          title: newDraft.name, 
          description: newDraft.description, 
          allTeams: pickOrder 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create draft')
      }

      // Refresh the drafts list
      await getMockDrafts()
      
      setIsCreateModalOpen(false)
      setNewDraft({ name: '', description: '', rounds: 7 })
      setPickOrder(allTeams) // Reset pick order

    } catch (error) {
      console.error('Error creating draft:', error)
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/deleteFantasyMockDraft`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mockDraftId: draftId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      // If the deleted draft was selected, clear the selection
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null)
        setCurrentDraftPicks([])
        setSelectedPick(null)
      }

      // Refresh the drafts list
      await getMockDrafts()
      setDeletingDraft(null)

    } catch (error) {
      console.error('Error deleting draft:', error)
      setDeletingDraft(null)
    }
  }

  const handlePlayerSelect = async (player: NFLPlayer) => {
    if (!selectedPick || !selectedDraft) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/updateFantasyMockDraftPickPlayer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mockDraftPickId: selectedPick.id,
          playerId: player.id
        })
      })

      if (response.ok) {
        // Update local state
        const updatedPicks = currentDraftPicks.map(pick => 
          pick.id === selectedPick.id 
            ? { ...pick, player_id: player.id }
            : pick
        )
        setCurrentDraftPicks(updatedPicks)
        setSelectedPick(null)
        setPlayerSearchQuery('')
      }
    } catch (error) {
      console.error('Error updating pick:', error)
    }
  }

  const handlePlayerRemove = async (pick: FantasyMockDraftPick) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/updateFantasyMockDraftPickPlayer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mockDraftPickId: pick.id,
          playerId: null
        })
      })

      if (response.ok) {
        // Update local state
        const updatedPicks = currentDraftPicks.map(p => 
          p.id === pick.id 
            ? { ...p, player_id: null }
            : p
        )
        // @ts-expect-error - updatedPicks is not typed
        setCurrentDraftPicks(updatedPicks)
      }
    } catch (error) {
      console.error('Error removing player:', error)
    }
  }

  const handleTeamSwap = async (pick: FantasyMockDraftPick, newTeamId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/mock/updateFantasyMockDraftPickTeam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mockDraftPickId: pick.id,
            draftingTeamId: newTeamId
        })
      })

      if (response.ok) {
        // Update local state with new team ID
        setCurrentDraftPicks(prevPicks => 
          prevPicks.map(p => 
            p.id === pick.id 
              ? { ...p, drafting_team_id: newTeamId }
              : p
          )
        )
        
        // Close the editing modal
        setEditingTeam(null)
        
        // Force a re-render by clearing and setting selected pick if it was the edited pick
        if (selectedPick?.id === pick.id) {
          setSelectedPick(null)
          // Use setTimeout to ensure state update happens after render
          setTimeout(() => {
            setSelectedPick({...pick, drafting_team_id: newTeamId})
          }, 0)
        }
      }
    } catch (error) {
      console.error('Error updating pick team:', error)
    }
  }

  // Drag and drop handler for pick order
  const handlePickOrderDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(pickOrder)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPickOrder(items)
  }

  // Click off functionality - Fixed to prevent event bubbling issues
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // Only clear selection if clicking on the background, not on any interactive elements
    if (e.target === e.currentTarget) {
      setSelectedPick(null)
    }
  }, [])

  const filteredFiles = draftFiles.filter(file =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPlayers = nflPlayers.filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
    const query = playerSearchQuery.toLowerCase()
    const matchesSearch = fullName.includes(query) || player.position.toLowerCase().includes(query)
    const matchesFilter = playerFilter === 'ALL' || player.position === playerFilter
    const isDrafted = currentDraftPicks.some(pick => pick.player_id === player.id)
    const showPlayer = showDraftedPlayers || !isDrafted
    return matchesSearch && matchesFilter && showPlayer
  }).sort((a, b) => {
    // Sort by ADP for selection, but we won't show it
    return (a.adp_ppr || 999) - (b.adp_ppr || 999)
  })

  // Get unique positions for filter
  const positions = ['ALL', ...Array.from(new Set(nflPlayers.map(p => p.position))).sort()]

  // Helper function to get team roster
  const getTeamRoster = (teamId: string) => {
    return currentDraftPicks
      .filter(pick => pick.drafting_team_id === teamId && pick.player_id)
      .sort((a, b) => a.overall_pick - b.overall_pick)
      .map(pick => ({
        pick,
        player: getPlayerInfo(pick.player_id),
        nflTeam: getPlayerInfo(pick.player_id) ? getNFLTeamInfo(getPlayerInfo(pick.player_id)!.team_id) : null
      }))
  }

  // Helper function to get all team rosters for the roster tab
  const getAllTeamRosters = () => {
    return allTeams.map((teamId: string) => ({
      teamId,
      teamInfo: getTeamInfo(teamId),
      roster: getTeamRoster(teamId)
    })).filter((team: { teamInfo: any }) => team.teamInfo) // Only include teams we have info for
  }

  // Toggle team expansion
  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId)
    } else {
      newExpanded.add(teamId)
    }
    setExpandedTeams(newExpanded)
  }

  // Helper function to get team info
  const getTeamInfo = (teamId: string) => {
    const fantasyTeam = fantasyTeams.find(t => t.id === teamId)
    return fantasyTeam ? {
      name: fantasyTeam.team_name,
      abbreviation: fantasyTeam.team_name.substring(0, 3).toUpperCase(),
      color: '#3B82F6' // Default blue color
    } : null
  }

  // Helper function to get player info
  const getPlayerInfo = (playerId: string | null) => {
    if (!playerId) return null
    return nflPlayers.find(p => p.id === playerId)
  }

  // Helper function to get NFL team info
  const getNFLTeamInfo = (teamId: string) => {
    return nflTeams.find(t => t.id === teamId)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading mock drafts...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex min-h-0" onClick={handleBackgroundClick}>
      {/* Collapsible File Explorer Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-200 border-r bg-slate-50 flex flex-col relative`}>
        {!sidebarCollapsed ? (
          <>
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Mock Drafts
                </h3>
                <div className="flex items-center gap-2">
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Mock Draft</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Draft Name</Label>
                          <Input
                            id="name"
                            value={newDraft.name}
                            onChange={(e) => setNewDraft({...newDraft, name: e.target.value})}
                            placeholder="e.g., 2024 Mock Draft"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newDraft.description}
                            onChange={(e) => setNewDraft({...newDraft, description: e.target.value})}
                            placeholder="Optional description"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="rounds">Number of Rounds</Label>
                          <Select 
                            value={newDraft.rounds.toString()} 
                            onValueChange={(value) => setNewDraft({...newDraft, rounds: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(round => (
                                <SelectItem key={round} value={round.toString()}>
                                  {round} Round{round !== 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Draft Type</Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={isSnakeDraft}
                                onChange={() => setIsSnakeDraft(true)}
                                className="mr-2"
                              />
                              Snake Draft
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={!isSnakeDraft}
                                onChange={() => setIsSnakeDraft(false)}
                                className="mr-2"
                              />
                              Standard Draft
                            </label>
                          </div>
                        </div>

                                                                <div>
                          <Label htmlFor="pickOrder">Pick Order</Label>
                          <div className="mt-2">
                            <DragDropContext onDragEnd={handlePickOrderDragEnd}>
                              <Droppable droppableId="pick-order">
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                    {pickOrder.map((teamId, index) => {
                                      const team = fantasyTeams.find(t => t.id === teamId);
                                      return (
                                        <Draggable key={teamId} draggableId={teamId} index={index}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`flex items-center gap-2 p-2 bg-white border rounded transition-all ${
                                                snapshot.isDragging 
                                                  ? 'shadow-lg rotate-3 z-50 bg-blue-50 border-blue-200' 
                                                  : 'hover:bg-gray-50'
                                              }`}
                                              style={{
                                                ...provided.draggableProps.style,
                                                ...(snapshot.isDragging && {
                                                  transform: `${provided.draggableProps.style?.transform} rotate(3deg)`,
                                                })
                                              }}
                                            >
                                              <div 
                                                {...provided.dragHandleProps}
                                                className="cursor-grab active:cursor-grabbing"
                                              >
                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                              </div>
                                              <span className="w-8 text-sm text-gray-500">#{index + 1}</span>
                                              <span className="flex-1 text-sm select-none">
                                                {team ? team.team_name : teamId}
                                              </span>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateDraft}
                            disabled={!newDraft.name.trim() || !allTeams.length}
                          >
                            Create Draft
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search drafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {searchQuery ? 'No matching drafts found' : 'No mock drafts yet'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      className={`p-3 rounded cursor-pointer transition-colors group ${
                        selectedDraft?.id === file.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDraftSelect(file)
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{file.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingDraft(file.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mb-1 line-clamp-2">{file.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{file.rounds} rounds</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(file.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="w-full h-8 justify-center"
            >
              <Folder className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-4 -right-3 z-10 h-6 w-6 rounded-full bg-white border shadow-sm hover:shadow-md"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Main Draft View */}
      <div className="flex-1 flex flex-col min-h-0">
        {!selectedDraft ? (
          <Card className="m-4">
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Select a mock draft from the sidebar</p>
                <p className="text-sm text-gray-400">or create a new one to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedDraft.title}</h2>
                  <p className="text-sm text-gray-600">{selectedDraft.description}</p>
                </div>
                <Badge variant="outline">
                  {selectedDraft.rounds} Round{selectedDraft.rounds !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="draft">Draft Board</TabsTrigger>
                  <TabsTrigger value="rosters">Team Rosters</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {picksLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading draft picks...</p>
              </div>
            ) : (
              <Tabs value={activeTab} className="flex-1 flex flex-col min-h-0">
                {/* Draft Board Tab */}
                <TabsContent value="draft" className="flex-1 flex min-h-0 mt-0">
                  <div className="flex flex-1 min-h-0">
                    {/* Draft Board - Table Layout */}
                    <div className="flex-1 overflow-auto p-4">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Pick</TableHead>
                              <TableHead className="w-20">Team</TableHead>
                              <TableHead>Player</TableHead>
                              <TableHead className="w-16">Pos</TableHead>
                              <TableHead className="w-16">NFL</TableHead>
                              <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentDraftPicks
                              .sort((a, b) => a.overall_pick - b.overall_pick)
                              .map((pick, index) => {
                                const teamInfo = getTeamInfo(pick.drafting_team_id)
                                const playerInfo = getPlayerInfo(pick.player_id)
                                const nflTeamInfo = playerInfo ? getNFLTeamInfo(playerInfo.team_id) : null
                                const isRoundStart = index === 0 || currentDraftPicks[index - 1]?.round_number !== pick.round_number
                                
                                return (
                                  <React.Fragment key={pick.id}>
                                    {isRoundStart && (
                                      <TableRow className="bg-blue-50">
                                        <TableCell colSpan={6} className="text-sm font-medium text-blue-900">
                                          Round {pick.round_number}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow 
                                      className={`hover:bg-gray-50 cursor-pointer ${
                                        selectedPick?.id === pick.id ? 'bg-blue-50 ring-1 ring-blue-300' : ''
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedPick(selectedPick?.id === pick.id ? null : pick)
                                      }}
                                    >
                                      <TableCell className="font-medium">
                                        <Badge variant="outline" className="text-xs">
                                          {pick.overall_pick}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setViewingTeamRoster(pick.drafting_team_id)
                                          }}
                                          className="h-6 px-2 text-xs hover:bg-blue-100"
                                        >
                                          {teamInfo?.abbreviation || 'UNK'}
                                        </Button>
                                      </TableCell>
                                      <TableCell>
                                        {playerInfo ? (
                                          `${playerInfo.first_name} ${playerInfo.last_name}`
                                        ) : (
                                          <span className="text-gray-400 italic">
                                            Round {pick.round_number} Pick {pick.pick_number} for {teamInfo?.name || 'Unknown Team'}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {playerInfo && (
                                          <Badge variant="outline" className="text-xs">
                                            {playerInfo.position}
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-gray-500">
                                        {nflTeamInfo?.team_abbrev || (playerInfo ? 'FA' : '')}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setEditingTeam(pick)
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-blue-100"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          {playerInfo && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handlePlayerRemove(pick)
                                              }}
                                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                )
                              })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Player Selection Sidebar */}
                    {selectedPick && (
                      <div className="w-80 border-l bg-slate-50 flex flex-col">
                        <div className="p-4 border-b bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                Pick #{selectedPick.overall_pick}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {getTeamInfo(selectedPick.drafting_team_id)?.name || 'Unknown Team'} • Round {selectedPick.round_number}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedPick(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search players..."
                                value={playerSearchQuery}
                                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                                className="pl-9"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Select value={playerFilter} onValueChange={setPlayerFilter}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {positions.map(pos => (
                                      <SelectItem key={pos} value={pos}>
                                        {pos === 'ALL' ? 'All Positions' : pos}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant={showDraftedPlayers ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowDraftedPlayers(!showDraftedPlayers)}
                                className="px-3"
                              >
                                {showDraftedPlayers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-2">
                          {filteredPlayers.length === 0 ? (
                            <div className="text-center py-8 text-sm text-gray-500">
                              No players found
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredPlayers.slice(0, 100).map(player => { // Limit to first 100 for performance
                                const nflTeamInfo = getNFLTeamInfo(player.team_id)
                                const isDrafted = currentDraftPicks.some(pick => pick.player_id === player.id)
                                
                                return (
                                  <div
                                    key={player.id}
                                    className={`p-3 rounded cursor-pointer transition-colors ${
                                      isDrafted 
                                        ? 'bg-red-50 opacity-50 cursor-not-allowed' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      !isDrafted && handlePlayerSelect(player)
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">
                                          {player.first_name} {player.last_name}
                                          {isDrafted && <span className="text-red-500 ml-1">(Drafted)</span>}
                                        </h4>
                                        <p className="text-xs text-gray-500">{nflTeamInfo?.team_abbrev || 'FA'}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {player.position}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Team Rosters Tab */}
                <TabsContent value="rosters" className="flex-1 flex flex-col mt-0 overflow-hidden">
                  <div className="flex-1 overflow-hidden p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 h-full overflow-y-auto">
                      {getAllTeamRosters().map(({ teamId, teamInfo, roster }: { teamId: string, teamInfo: any, roster: any }) => {
                        const isExpanded = expandedTeams.has(teamId)
                        return (
                          <div 
                            key={teamId} 
                            className="bg-white border rounded-lg flex flex-col h-fit max-h-96"
                          >
                            <div 
                              className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleTeamExpansion(teamId)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h3 className="font-semibold text-sm truncate">
                                    {teamInfo?.name}
                                  </h3>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {roster.length}
                                  </Badge>
                                </div>
                                <ChevronRight className={`h-4 w-4 transition-transform shrink-0 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`} />
                              </div>
                              {!isExpanded && (
                                <div className="mt-2 text-xs text-gray-500 truncate">
                                  {roster.length === 0 
                                    ? 'No picks yet' 
                                    // @ts-expect-error - roster is not typed
                                    : `${roster.slice(0, 2).map(r => r.player?.last_name).join(', ')}${roster.length > 2 ? '...' : ''}`
                                  }
                                </div>
                              )}
                            </div>
                            
                            {isExpanded && (
                              <div className="flex-1 overflow-y-auto">
                                {roster.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-gray-500">
                                    No players drafted yet
                                  </div>
                                ) : (
                                  <div className="p-4 space-y-2">
                                    {roster.map(({ pick, player, nflTeam }: { pick: any, player: any, nflTeam: any }) => (
                                      <div key={pick.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                          <Badge variant="outline" className="text-xs">
                                            {pick.overall_pick}
                                          </Badge>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm truncate">
                                            {player?.first_name} {player?.last_name}
                                          </div>
                                          <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                                            <span>R{pick.round_number}</span>
                                            <span>•</span>
                                            <Badge variant="outline" className="text-xs">
                                              {player?.position}
                                            </Badge>
                                            <span>•</span>
                                            <span>{nflTeam?.team_abbrev || 'FA'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Team Roster Modal */}
            {viewingTeamRoster && (
              <Dialog open={!!viewingTeamRoster} onOpenChange={() => setViewingTeamRoster(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {getTeamInfo(viewingTeamRoster)?.name || 'Unknown Team'} Roster
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {getTeamRoster(viewingTeamRoster).length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500">
                        No players drafted yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getTeamRoster(viewingTeamRoster).map(({ pick, player, nflTeam }) => (
                          <div key={pick.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {player?.first_name} {player?.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Round {pick.round_number}, Pick #{pick.overall_pick} • {player?.position} • {nflTeam?.team_abbrev || 'FA'}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {player?.position}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Draft Delete Confirmation Modal */}
            {deletingDraft && (
              <Dialog open={!!deletingDraft} onOpenChange={() => setDeletingDraft(null)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete Mock Draft</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete &quot;{draftFiles.find(d => d.id === deletingDraft)?.title}&quot;? 
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDeletingDraft(null)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => deletingDraft && handleDeleteDraft(deletingDraft)}
                      >
                        Delete Draft
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Team Edit Modal */}
            {editingTeam && (
              <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
                <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle>Change Team for Pick #{editingTeam.overall_pick}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Team</Label>
                      <Select 
                        value={editingTeam.drafting_team_id} 
                        onValueChange={(value) => {
                          handleTeamSwap(editingTeam, value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allTeams.map((teamId: string) => {
                            const teamInfo = getTeamInfo(teamId)
                            return (
                              <SelectItem key={teamId} value={teamId}>
                                {teamInfo?.name || 'Unknown Team'}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingTeam(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
    </div>
  )
}