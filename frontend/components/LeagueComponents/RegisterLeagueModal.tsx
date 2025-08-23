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
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface RegisterLeagueModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onRefresh: () => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function RegisterLeagueModal({ isOpen, onClose, userId, onRefresh }: RegisterLeagueModalProps) {
  const [externalLeagueId, setExternalLeagueId] = useState('')
  const [espnS2, setEspnS2] = useState('')
  const [swid, setSwid] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leagueDetails, setLeagueDetails] = useState<null | {
    league_name: string,
    team_details: { team_abbrev: string, team_id: number, team_name: string }[]
  }>(null)

  // New: selected team id string
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!externalLeagueId.trim() || !espnS2.trim() || !swid.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const url = `${BACKEND_URL}/league/getLeagueDetailsRegister?leagueId=${externalLeagueId}&espnS2=${encodeURIComponent(espnS2)}&swid=${encodeURIComponent(swid)}&year=${new Date().getFullYear()}`
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch league details')
        throw new Error(errorData.error || 'Failed to fetch league details')
      }

      const data = await response.json()
      setLeagueDetails(data.leagueDetails)
      setSelectedTeamId(null) // reset team selection when new league found
    } catch (error) {
      console.error('Error fetching league details:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch league details"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!leagueDetails || !selectedTeamId) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/league/registerLeague`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: userId,
          adminTeamId: selectedTeamId,
          leagueId: externalLeagueId,
          espnS2,
          swid,
          allTeams: leagueDetails.team_details.map((team) => ({
            teamId: team.team_id,
            teamName: team.team_name,
            teamAbbrev: team.team_abbrev,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to register league'
        setError(errorMessage)
        return
      }

      toast.success("Your league has been registered")
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Error registering league:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to register league"
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
    setEspnS2('')
    setSwid('')
    onClose()
  }

  const handleBack = () => {
    setError(null)
    setLeagueDetails(null)
    setSelectedTeamId(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register a New League</DialogTitle>
          <DialogDescription>
            {leagueDetails
              ? "We found your league! Select your team and register."
              : "Enter your ESPN league details to search."}
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
              <Label htmlFor="leagueId" className="text-right">League Id</Label>
              <Input id="leagueId" value={externalLeagueId} onChange={(e) => setExternalLeagueId(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="espnS2" className="text-right">ESPN S2</Label>
              <Input id="espnS2" value={espnS2} onChange={(e) => setEspnS2(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="swid" className="text-right">SWID</Label>
              <Input id="swid" value={swid} onChange={(e) => setSwid(e.target.value)} className="col-span-3" />
            </div>
          </div>
        )}

        {leagueDetails && (
          <div className="py-4 space-y-4">
            <h3 className="font-semibold text-lg">{leagueDetails.league_name}</h3>

            <RadioGroup value={selectedTeamId ?? ''} onValueChange={setSelectedTeamId}>
              <div className="space-y-2">
                {leagueDetails.team_details.map((team) => (
                  <div key={team.team_id} className="flex items-center gap-2">
                    <RadioGroupItem value={team.team_id.toString()} id={`team-${team.team_id}`} />
                    <Label htmlFor={`team-${team.team_id}`} className="cursor-pointer flex items-center gap-2">
                      <Badge variant="outline">{team.team_abbrev}</Badge>
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
                {isLoading ? "Searching..." : "Search for League"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleRegister} disabled={isLoading || !selectedTeamId}>
                {isLoading ? "Registering..." : "Register League"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
