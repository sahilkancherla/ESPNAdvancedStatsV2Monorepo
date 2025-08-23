'use client'

import React from 'react'
import { DraftPick } from '@/lib/interfaces'
import { Badge } from '@/components/ui/badge'

interface DraftComponentProps {
  title: string
  badgeText: string
  subtitleOne: string
  subtitleTwo: string
  leftValue: string
}
  

export default function DraftBoardNFLPlayer({ title, badgeText, subtitleOne, subtitleTwo, leftValue }: DraftComponentProps) {

  return (
    <div
      className="flex items-center gap-4 px-3"
      style={{ maxHeight: '60px', overflowY: 'auto' }}
    >
      {/* Left: idx - fixed width and height, right aligned */}
      <div className="w-8 h-8 flex items-center justify-end font-mono text-sm text-gray-600 select-none">
        {leftValue}
      </div>

      {/* Right: player info */}
      <div className="flex flex-col max-w-[250px]">
        <div className="flex items-center gap-2 font-semibold text-gray-900 truncate" title={`${title}`}>
          {title}
          {badgeText.length > 0 && <Badge variant="outline">{badgeText}</Badge>}
        </div>
        {(subtitleOne && subtitleOne.length > 0) || (subtitleTwo && subtitleTwo.length > 0) ? (
          <div className="text-xs italic text-gray-500 mt-0.5 truncate">
            {subtitleOne && subtitleOne.length > 0 ? subtitleOne : ""}
            {(subtitleOne && subtitleOne.length > 0) && (subtitleTwo && subtitleTwo.length > 0) ? " - " : ""}
            {subtitleTwo && subtitleTwo.length > 0 ? subtitleTwo : ""}
          </div>
        ) : null}
      </div>
    </div>
  )
}
