"use client";

import { GripVertical, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { PLAYER_LABELS, getLabelConfig, getLabelColor } from "@/lib/utils";

interface PlayerLabelDropdownProps {
  currentLabel?: string | null
  onLabelChange: (label: string) => void
  size?: "sm" | "default" | "lg"
  variant?: "ghost" | "outline" | "default"
  className?: string
}

export function PlayerLabelDropdown({ 
  currentLabel, 
  onLabelChange, 
  size = "sm", 
  variant = "ghost",
  className = ""
}: PlayerLabelDropdownProps) {
  const currentConfig = getLabelConfig(currentLabel)
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={`h-6 px-2 text-xs ${className}`}
        >
          <span className={currentConfig.color}>
            {currentConfig.label || "Label"}
          </span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => onLabelChange(PLAYER_LABELS.NONE.value)}>
          <span className={PLAYER_LABELS.NONE.color}>
            {PLAYER_LABELS.NONE.label}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {Object.values(PLAYER_LABELS)
          .filter(label => label.value !== "") // Exclude "No Label" from the list
          .map(label => (
            <DropdownMenuItem 
              key={label.value} 
              onClick={() => onLabelChange(label.value)}
            >
              <span className={label.color}>
                {label.label}
              </span>
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Types for the player - adjust according to your actual types
interface BigBoardPlayer {
  id: string | number;
  first_name: string;
  last_name: string;
  position: string;
  team_abbrev?: string;
  label?: string;
  notes?: string;
  big_board_id?: string | number;
}

const positionColors = {
  QB: "bg-blue-100 text-blue-800 border-blue-200",
  RB: "bg-green-100 text-green-800 border-green-200", 
  WR: "bg-purple-100 text-purple-800 border-purple-200",
  TE: "bg-orange-100 text-orange-800 border-orange-200",
  K: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "D/ST": "bg-red-100 text-red-800 border-red-200"
};

interface SortableItemProps {
  id: string;
  player: BigBoardPlayer;
  rank: number;
  isDragging?: boolean;
}

// Memoize rank color calculation
const getRankColor = (rank: number) => {
  if (rank <= 12) return "text-green-600 bg-green-50";
  if (rank <= 24) return "text-yellow-600 bg-yellow-50";
  if (rank <= 50) return "text-orange-600 bg-orange-50";
  return "text-gray-600 bg-gray-50";
};

// Memoize the component to prevent unnecessary re-renders
export const SortableItem = memo(function SortableItem({ 
  id, 
  player, 
  rank, 
  isDragging = false 
}: SortableItemProps) {
  const [playerLabel, setPlayerLabel] = useState(player.label || "");
  const [localNotes, setLocalNotes] = useState(player.notes || "");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // API call to update player label
  const updatePlayerLabel = useCallback(async (playerId: string, label: string) => {
    setPlayerLabel(label);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/league/updateBigBoardPlayerLabel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, label }),
      });

      if (!response.ok) {
        throw new Error('Failed to update player label');
      }

      const message = await response.json();
      console.log(message);
    } catch (error) {
      console.error('Error updating player label:', error);
      setPlayerLabel(player.label || "");
    }
  }, [player.label]);

  // API call to update player notes
  const updatePlayerNotes = useCallback(async (playerId: string, notes: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/league/updateBigBoardPlayerNotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update player notes');
      }

      const message = await response.json();
      console.log(message);
    } catch (error) {
      console.error('Error updating player notes:', error);
    }
  }, []);

  const handleLabelChange = useCallback((label: string) => {
    console.log("player.big_board_id")
    console.log(player.big_board_id)
    updatePlayerLabel(player.big_board_id, label);
  }, [player.big_board_id, updatePlayerLabel]);

  const handleNotesChange = useCallback((notes: string) => {
    setLocalNotes(notes);
  }, []);

  const handleNotesSave = useCallback(() => {
    if (localNotes !== player.notes) {
      updatePlayerNotes(player.big_board_id, localNotes);
    }
    setIsNotesOpen(false);
  }, [localNotes, player.notes, player.big_board_id, updatePlayerNotes]);

  const handleNotesCancel = useCallback(() => {
    setLocalNotes(player.notes || "");
    setIsNotesOpen(false);
  }, [player.notes]);

  // Pre-calculate values to avoid inline calculations
  const rankColorClass = getRankColor(rank);
  const positionColorClass = positionColors[player.position as keyof typeof positionColors];

  return (
    <div
      className={`
        group flex items-center gap-3 p-3 border rounded-lg bg-white 
        shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300
        ${isDragging ? 'shadow-xl border-blue-400 bg-blue-50 scale-105' : 'cursor-grab'}
      `}
    >
      {/* Drag Handle */}
      <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
      
      {/* Rank */}
      <div className={`
        font-mono text-xs font-bold px-2 py-1 rounded-full min-w-[2.5rem] text-center
        ${rankColorClass}
      `}>
        #{rank}
      </div>

      {/* Player Info */}
      <div className="flex-[2] min-w-0 mr-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={`${positionColorClass} text-xs font-semibold flex-shrink-0`}>
            {player.position}
          </Badge>
          <span className="font-medium text-gray-900 truncate text-sm">
            {player.first_name} {player.last_name}
          </span>
        </div>
        
        {/* Optional: Add team info if available */}
        {player.team_abbrev && (
          <div className="text-xs text-gray-500 mt-1 pl-1">
            {player.team_abbrev}
          </div>
        )}
      </div>

      {/* Label Dropdown - Hide during drag to improve performance */}
      {!isDragging && <PlayerLabelDropdown
        currentLabel={playerLabel}
        onLabelChange={handleLabelChange}
        size="sm"
        variant="ghost"
        className="h-6 px-2 text-xs"
      />}

      {/* Notes Dropdown - Hide during drag to improve performance */}
      {!isDragging && (
        <DropdownMenu open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-6 px-2 text-xs ${player.notes ? 'text-blue-600' : ''}`}
            >
              Notes
              <MessageSquare className={`h-3 w-3 ml-1 ${player.notes ? 'fill-current' : ''}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-0">
            <div className="p-3">
              <textarea
                value={localNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes about this player..."
                className="w-full h-20 p-2 text-xs border rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  onClick={handleNotesSave}
                  className="h-6 px-2 text-xs"
                >
                  Save
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleNotesCancel}
                  className="h-6 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
});