/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useNFLData } from "@/context/NFLDataContext";
import { useLeagueTeamData } from "@/context/LeagueTeamDataContext";
import { useFantasyData } from "@/context/FantasyDataContext";
import { Edit, Save, X } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface EditingState {
  [key: string]: {
    actualNflPlayerId: string;
    actualFantasyTeamId: string;
  };
}

export function DraftAnalysis({
  draftData, 
  getPositionBadgeStyle, 
  getRankDifferenceBadgeStyle, 
  getFantasyPlayerTotalSeasonPoints
}: {
  draftData: any;
  getPositionBadgeStyle: (position: string) => string;
  getRankDifferenceBadgeStyle: (rankDifference: number) => React.ReactElement | null | undefined;
  getFantasyPlayerTotalSeasonPoints: (playerId: string) => number | undefined;
}) {
  const { nflPlayers, nflTeams } = useNFLData();
  const { selectedLeagueId, leagues } = useLeagueTeamData();
  const { refetchData } = useFantasyData();
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId);
  const fantasyTeams = selectedLeague?.teams; // each has a team_id
  const nonDraftedPlayers = nflPlayers.filter(player => 
    /* eslint-disable @typescript-eslint/no-explicit-any */
    !draftData.some((pick: any) => pick.player_id === player.id)
  );

  const [editedDraftData, setEditedDraftData] = useState(draftData);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editingState, setEditingState] = useState<EditingState>({});
  const [saving, setSaving] = useState<Set<string>>(new Set());


  const handleStartEdit = (pick: any) => {
    setEditingRows(prev => new Set(prev).add(pick.id));
    setEditingState(prev => ({
      ...prev,
      [pick.id]: {
        actualNflPlayerId: pick.player_id || '',
        actualFantasyTeamId: pick.fantasy_team_id || pick.team_id || ''
      }
    }));
  };

  const handleCancelEdit = (pickId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(pickId);
      return newSet;
    });
    setEditingState(prev => {
      const { [pickId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleEditChange = (pickId: string, field: 'actualNflPlayerId' | 'actualFantasyTeamId', value: string) => {
    setEditingState(prev => ({
      ...prev,
      [pickId]: {
        ...prev[pickId],
        [field]: value
      }
    }));
  };

  const handleSaveDraftedPlayer = async (pickId: string) => {
    const editData = editingState[pickId];
    if (!editData) return;

    setSaving(prev => new Set(prev).add(pickId));

    try {
      const response = await fetch(`${BACKEND_URL}/league/editDraftedPlayer`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: pickId,
          actualNflPlayerId: editData.actualNflPlayerId,
          actualTeamId: editData.actualFantasyTeamId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      
      // Update local state immediately for instant UI feedback
      /* eslint-disable @typescript-eslint/no-explicit-any */
      setEditedDraftData((prev: any) => prev.map((pick: any) => {
        if (pick.id === pickId) {
          // Find the selected player and fantasy team for updated display
          const selectedPlayer = nflPlayers.find(p => p.id === editData.actualNflPlayerId);
          const selectedFantasyTeam = fantasyTeams?.find(t => t.id === editData.actualFantasyTeamId);
          
          return {
            ...pick,
            player_id: editData.actualNflPlayerId,
            fantasy_team_id: editData.actualFantasyTeamId,
            team_id: editData.actualFantasyTeamId,
            player: selectedPlayer?.first_name + ' ' + selectedPlayer?.last_name || pick.player,
            nflTeamName: getNflTeamNameById(selectedPlayer?.team_id || '') || pick.nflTeamName,
            position: selectedPlayer?.position || pick.position,
            fantasyTeamName: selectedFantasyTeam?.team_name || pick.fantasyTeamName
          };
        }
        return pick;
      }));
      
      // Trigger refetch of fantasy data to keep context in sync
      refetchData();
      
      // Exit edit mode for this row
      handleCancelEdit(pickId);
    } catch (error) {
      console.error("Error editing drafted player:", error);
      // You might want to show a toast or error message here
    } finally {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(pickId);
        return newSet;
      });
    }
  };

  const getNflTeamNameById = (teamId: string) => {
    return nflTeams.find(team => team.id === teamId)?.team_name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Results</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20"></TableHead>
              <TableHead>Player</TableHead>
              <TableHead></TableHead>
              <TableHead>Total Season Points</TableHead>
              <TableHead>Current/Draft Position Rank</TableHead>
              <TableHead>Drafting Team</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedDraftData.map((pick: any) => {
              const isEditing = editingRows.has(pick.id);
              const isSaving = saving.has(pick.id);
              const editData = editingState[pick.id];

              return (
                <TableRow key={pick.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">
                    <Badge variant="outline" className="ml-2">
                      Round {pick.round_number} Pick {pick.pick_number}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="font-medium">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Select
                          value={editData?.actualNflPlayerId || ''}
                          onValueChange={(value) => handleEditChange(pick.id, 'actualNflPlayerId', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select player..." />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Current player option */}
                            <SelectItem value={pick.player_id}>
                              {pick.player} (Current)
                            </SelectItem>
                            {/* Available players */}
                            {nonDraftedPlayers.map(player => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.first_name} {player.last_name} - {player.position} ({getNflTeamNameById(player.team_id)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-large font-bold">{pick.player}</div>
                          <div className="text-sm text-muted-foreground">
                            {pick.nflTeamName}
                          </div>
                        </div>
                        <div>
                          <Badge 
                            variant="outline" 
                            className={getPositionBadgeStyle(pick.position)}
                          >
                            {pick.position}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {!isEditing && getRankDifferenceBadgeStyle(pick.weightedRankDifference)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {!isEditing && getFantasyPlayerTotalSeasonPoints(pick.player_id)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {!isEditing && `${pick.position}${pick.positionRank} / ${pick.position}${pick.draftPositionRank}`}
                  </TableCell>
                  
                  <TableCell className="text-muted-foreground">
                    {isEditing ? (
                      <Select
                        value={editData?.actualFantasyTeamId || ''}
                        onValueChange={(value) => handleEditChange(pick.id, 'actualFantasyTeamId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select fantasy team..." />
                        </SelectTrigger>
                        <SelectContent>
                          {fantasyTeams?.map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.team_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      pick.fantasyTeamName
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveDraftedPlayer(pick.id)}
                            disabled={isSaving || !editData?.actualNflPlayerId || !editData?.actualFantasyTeamId}
                            className="flex items-center space-x-1"
                          >
                            <Save className="h-3 w-3" />
                            <span>{isSaving ? 'Saving...' : 'Save'}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelEdit(pick.id)}
                            disabled={isSaving}
                            className="flex items-center space-x-1"
                          >
                            <X className="h-3 w-3" />
                            <span>Cancel</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(pick)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}