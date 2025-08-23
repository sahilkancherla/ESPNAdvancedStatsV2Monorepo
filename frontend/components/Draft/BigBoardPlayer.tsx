'use client'

import React, { useState } from 'react'
import { BigBoardPlayer } from '@/lib/interfaces'
import { Badge } from '@/components/ui/badge'
import { Check, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLAYER_LABELS, getLabelConfig, getLabelColor } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface DraftComponentProps {
  bigBoardPlayer: BigBoardPlayer
  idx: number
  onDraftToggle?: (playerId: string, isDrafted: boolean) => void
}

function shortenName(firstName: string, lastName: string, maxLength: number) {
  let fullName = `${firstName} ${lastName}`
  if (fullName.length <= maxLength) return fullName

  // First initial + last name
  fullName = `${firstName[0]}. ${lastName}`
  if (fullName.length <= maxLength) return fullName

  // Truncate last name if still too long
  const allowedLastNameLength = maxLength - (firstName[0].length + 3) // "X. " + "…"
  const truncatedLastName =
    lastName.length > allowedLastNameLength
      ? lastName.slice(0, allowedLastNameLength) + '…'
      : lastName

  return `${firstName[0]}. ${truncatedLastName}`
}

export default function NFLPlayerComponent({ 
  bigBoardPlayer, 
  idx, 
  onDraftToggle 
}: DraftComponentProps) {
  const [isDrafted, setIsDrafted] = useState(bigBoardPlayer.drafted || false)
  
  const maxNameLength = 12 // Reduced for better sidebar fit
  const displayName = shortenName(bigBoardPlayer.first_name, bigBoardPlayer.last_name, maxNameLength)

  const handleDraftToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newDraftedState = !isDrafted
    setIsDrafted(newDraftedState)
    onDraftToggle?.(bigBoardPlayer.big_board_id, newDraftedState)
  }

  const handleUndoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDrafted(false)
    onDraftToggle?.(bigBoardPlayer.big_board_id, false)
  }

  return (
    <div>
    {bigBoardPlayer.notes && bigBoardPlayer.notes.length > 0 ? (
      <HoverCard>
        <HoverCardTrigger>
          <div
            className={cn(
              "group relative transition-all duration-200 rounded-sm p-1 cursor-pointer",
              isDrafted && "opacity-50"
            )}
            onClick={!isDrafted ? handleDraftToggle : undefined}
          >
            <div className="flex items-center justify-between gap-1">
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium transition-colors",
                  isDrafted ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  <div className="flex flex-col">
                    <span className="truncate">
                      {displayName}
                    </span>
                    <span className="text-[8px] text-amber-500 flex items-center gap-1">
                      <Info className="w-2 h-2" />
                      Notes available
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "text-[10px] truncate transition-colors",
                  isDrafted ? "text-muted-foreground/60" : "text-muted-foreground"
                )}>
                  {bigBoardPlayer.team_abbrev}
                </div>
              </div>

              {/* Draft Status & Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">

                {bigBoardPlayer.label && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[9px] h-4 px-1 transition-opacity",
                      isDrafted && "opacity-50"
                    )}
                  >
                    <span className={getLabelColor(bigBoardPlayer.label)}>
                      {getLabelConfig(bigBoardPlayer.label).label}
                    </span>
                  </Badge>
                )}
                
                {isDrafted ? (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <button
                      onClick={handleUndoClick}
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Undo draft"
                    >
                      <X className="w-2.5 h-2.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 transition-colors">
                    <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 bg-green-500 transition-opacity" />
                  </div>
                )}
              </div>
            </div>

            {/* Drafted overlay */}
            {isDrafted && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-sm pointer-events-none" />
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm">
                {bigBoardPlayer.first_name} {bigBoardPlayer.last_name}
              </div>
              <Badge variant="outline" className="text-xs">
                {bigBoardPlayer.position}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {bigBoardPlayer.notes}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    ) : (
      <div
        className={cn(
          "group relative transition-all duration-200 rounded-sm p-1 cursor-pointer",
          isDrafted && "opacity-50"
        )}
        onClick={!isDrafted ? handleDraftToggle : undefined}
      >
        <div className="flex items-center justify-between gap-1">
          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium transition-colors",
              isDrafted ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              <span className="truncate">
                {displayName}
              </span>
            </div>
            <div className={cn(
              "text-[10px] truncate transition-colors",
              isDrafted ? "text-muted-foreground/60" : "text-muted-foreground"
            )}>
              {bigBoardPlayer.team_abbrev}
            </div>
          </div>

          {/* Draft Status & Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* {bigBoardPlayer.tier && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[9px] h-4 px-1 transition-opacity",
                  isDrafted && "opacity-50"
                )}
              >
                T{bigBoardPlayer.tier}
              </Badge>
            )} */}

            {bigBoardPlayer.label && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[9px] h-4 px-1 transition-opacity",
                  isDrafted && "opacity-50"
                )}
              >
                <span className={getLabelColor(bigBoardPlayer.label)}>
                  {getLabelConfig(bigBoardPlayer.label).label}
                </span>
              </Badge>
            )}
            
            {isDrafted ? (
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <button
                  onClick={handleUndoClick}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors opacity-0 group-hover:opacity-100"
                  title="Undo draft"
                >
                  <X className="w-2.5 h-2.5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-4 h-4 rounded-full border border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 transition-colors">
                <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 bg-green-500 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Drafted overlay */}
        {isDrafted && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-sm pointer-events-none" />
        )}
      </div>
    )}
    </div>
  )
}