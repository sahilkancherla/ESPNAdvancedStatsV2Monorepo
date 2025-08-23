'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

interface JoinLeagueModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onRefresh: () => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function JoinLeagueModal({ isOpen, onClose, userId, onRefresh }: JoinLeagueModalProps) {
  const [externalLeagueId, setExternalLeagueId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leagueDetails, setLeagueDetails] = useState<null | {
    league_name: string
    league_id: string
    team_details: {
      team_id: string
      team_abbrev: string | null
      espn_team_id: number
      team_name: string
      user_id: string | null
    }[]
  }>(null)

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!externalLeagueId.trim()) {
      toast.error("Please enter a League ID")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const url = `${BACKEND_URL}/league/getLeagueDetailsJoin?externalLeagueId=${externalLeagueId}`
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch league details')
      }

      const data = await response.json()
      setLeagueDetails(data.leagueDetails)
      setSelectedTeamId(null) // reset team selection on new search
    } catch (error) {
      console.error('Error fetching league details:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch league details"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!leagueDetails || !selectedTeamId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/league/joinLeague`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          leagueId: leagueDetails.league_id,
          teamId: selectedTeamId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to join league'
        setError(errorMessage)
        return
      }

      toast.success("You've successfully joined the league")
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Error joining league:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to join league"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setLeagueDetails(null)
    setSelectedTeamId(null)
    setExternalLeagueId('')
    onClose()
  }

  const handleBack = () => {
    setError(null)
    setLeagueDetails(null)
    setSelectedTeamId(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a League</DialogTitle>
          <DialogDescription>
            {leagueDetails
              ? "Select your team to join the league."
              : "Enter the league ID to find your league."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 border border-destructive/20 rounded-md p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!leagueDetails && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leagueCode" className="text-right">
                League Id
              </Label>
              <Input
                id="leagueCode"
                value={externalLeagueId}
                onChange={(e) => setExternalLeagueId(e.target.value)}
                className="col-span-3"
                placeholder="Enter league id"
              />
            </div>
          </div>
        )}

        {leagueDetails && (
          <div className="py-4 space-y-4">
            <h3 className="font-semibold text-lg">{leagueDetails.league_name}</h3>

            <RadioGroup value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <div className="space-y-2">
                {leagueDetails.team_details.map((team) => (
                  <div key={team.team_id} className="flex items-center gap-2">
                    <RadioGroupItem value={team.team_id} id={`team-${team.team_id}`} />
                    <Label htmlFor={`team-${team.team_id}`} className="cursor-pointer flex items-center gap-2">
                      {team.team_abbrev && <Badge variant="outline">{team.team_abbrev}</Badge>}
                      <span>{team.team_name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        <DialogFooter>
          {!leagueDetails ? (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleJoin} disabled={isLoading || !selectedTeamId}>
                {isLoading ? "Joining..." : "Join League"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
