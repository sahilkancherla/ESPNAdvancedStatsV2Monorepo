/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, GripVertical, Save, X, RotateCcw } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { SortableItem } from "@/components/Draft/SortableItem";
import { id } from "zod/v4/locales";
import { NFLPlayer, BigBoardPlayer } from "@/lib/interfaces";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type EditBigBoardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  nflPlayers: NFLPlayer[];
  bigBoard: BigBoardPlayer[];
};

const positionsOrder = ["QB", "RB", "WR", "TE", "K", "D/ST"];

const positionColors = {
  QB: "bg-blue-100 text-blue-800 border-blue-200",
  RB: "bg-green-100 text-green-800 border-green-200", 
  WR: "bg-purple-100 text-purple-800 border-purple-200",
  TE: "bg-orange-100 text-orange-800 border-orange-200",
  K: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "D/ST": "bg-red-100 text-red-800 border-red-200"
};

// Helper function to reorder array
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export function EditBigBoardModal({
  isOpen,
  onClose,
  teamId,
  nflPlayers,
  bigBoard,
}: EditBigBoardModalProps) {
  const [players, setPlayers] = useState<BigBoardPlayer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (bigBoard && bigBoard.length > 0) {
        setPlayers(bigBoard);
      } else {
        setPlayers(nflPlayers.slice(0, 250) as BigBoardPlayer[]); // if no big board, use first 250 nfl players
      }
      setSearchTerm("");
      setHasChanges(false);
    }
  }, [isOpen, bigBoard, nflPlayers]);

  // Memoize filtered players to prevent unnecessary recalculations
  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return players;
    const searchLower = searchTerm.toLowerCase();
    return players.filter(player => 
      `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchLower) ||
      player.position.toLowerCase().includes(searchLower)
    );
  }, [players, searchTerm]);

  // Memoize players by position to prevent recalculation during drag
  const playersByPosition = useMemo(() => {
    return players.reduce((acc, player, index) => {
      // @ts-expect-error - player.position is not typed
      if (!acc[player.position]) acc[player.position] = [];
      acc[player.position].push({ ...player, rank: index + 1 });
      return acc;
    }, {} as Record<string, (typeof players)[0] & { rank: number }[]>);
  }, [players]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) {
      return;
    }

    // Find the actual indices in the full players array
    const sourcePlayerId = filteredPlayers[sourceIndex].id;
    const destPlayerId = filteredPlayers[destIndex].id;
    
    const fullSourceIndex = players.findIndex(p => p.id === sourcePlayerId);
    const fullDestIndex = players.findIndex(p => p.id === destPlayerId);

    setPlayers(prevPlayers => reorder(prevPlayers, fullSourceIndex, fullDestIndex));
    setHasChanges(true);
  }, [filteredPlayers, players]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    setPlayers(bigBoard.length > 0 ? bigBoard : nflPlayers as BigBoardPlayer[]);
    setHasChanges(false);
    onClose();
  }, [hasChanges, bigBoard, nflPlayers, onClose]);

  const handleReset = useCallback(() => {
    if (confirm("Reset to original order? This will lose all current and past changes.")) {
      setPlayers(nflPlayers as BigBoardPlayer[]);
      setHasChanges(true);
    }
  }, [nflPlayers]);

  const handleSave = async () => {
    setIsSaving(true);

    const bigBoardData = players.map((player, idx) => ({
      id: player.big_board_id,
      team_id: teamId,
      nfl_player_id: player.id,
      rank: idx + 1,
      tier: 1,
      // label: player.label,
      // notes: player.notes,
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/team/setBigBoard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bigBoardChunk: bigBoardData }),
      });
      
      if (!response.ok) throw new Error('Failed to save big board');

      setHasChanges(false);
      onClose();
    } catch (err) {
      console.error('Error saving big board:', err);
      alert('Failed to save big board. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced search input handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[98vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5" />
            Edit Big Board
            {hasChanges && (
              <Badge variant="secondary" className="ml-2">
                Unsaved Changes
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Drag players on the left to set rankings. The right panel shows live position breakdowns.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 overflow-hidden flex-1 min-h-0">
          {/* Left Column - Draggable Rankings */}
          <div className="w-1/3 flex flex-col min-h-0">
            <div className="mb-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{filteredPlayers.length} players</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50/50 min-h-0">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="players-list">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-full ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                    >
                      {filteredPlayers.map((player, index) => (
                        <Draggable 
                          key={player.id} 
                          draggableId={player.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                                  : provided.draggableProps.style?.transform
                              }}
                            >
                              <SortableItem
                                id={player.id.toString()}
                                player={player}
                                rank={players.findIndex(p => p.id === player.id) + 1}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Right Columns - Position Breakdown */}
          <div className="w-2/3 overflow-hidden">
            <h3 className="font-semibold mb-3 text-lg">Position Rankings</h3>
            <div className="h-full overflow-y-auto border rounded-lg p-4 bg-gray-50/50">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 h-fit">
                {positionsOrder.map((pos) => (
                  <div key={pos} className="bg-white rounded-lg p-4 border min-h-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${positionColors[pos as keyof typeof positionColors]} font-semibold`}>
                        {pos}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ({playersByPosition[pos]?.length || 0})
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {(playersByPosition[pos] ?? []).map((p, idx) => (
                        <div 
                          // @ts-expect-error - p.id is not typed
                          key={p.id}
                          className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm ${
                            idx < 3 ? 'bg-green-50 border-l-2 border-green-400' :
                            idx < 8 ? 'bg-yellow-50 border-l-2 border-yellow-400' :
                            'bg-gray-50 border-l-2 border-gray-300'
                          }`}
                        >
                          <span className="font-mono text-xs font-semibold text-gray-500 min-w-[2rem]">
                            #{p.rank}
                          </span>
                          <span className="truncate">
                            {/* @ts-expect-error - p.first_name is not typed */}
                            {p.first_name} {p.last_name}
                          </span>
                        </div>
                      ))}
                      {(playersByPosition[pos]?.length || 0) === 0 && (
                        <div className="text-gray-400 text-sm italic">
                          No players
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              {players.length} total players ranked
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}