'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Users, BarChart3, Activity } from 'lucide-react'
import { TimeWindowManager } from './TimeWindowManager'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type LoadingState = Record<string, boolean>

interface ConfirmDialog {
  open: boolean
  title: string
  description: string
  onConfirm: (() => void) | null
}

export function AdminContent() {
  const [loading, setLoading] = useState<LoadingState>({})
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({ open: false, title: '', description: '', onConfirm: null })
  const [liveTracking, setLiveTracking] = useState(false)
  const [liveTrackingInterval, setLiveTrackingInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Form states
  const [fantasyDraft, setFantasyDraft] = useState({ year: '', leagueId: '', swid: '', espnS2: '' })
  const [leagueRosters, setLeagueRosters] = useState({ year: '', leagueId: '', swid: '', espnS2: '' })
  const [bigPlayData, setBigPlayData] = useState({ week: '', year: '' })
  const [liveTrackingData, setLiveTrackingData] = useState({ week: '', year: '', leagueId: '', swid: '', espnS2: '' })

  const handleConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm })
  }

  const executeAction = async (actionName: string, endpoint: string, data: Record<string, string>) => {
    setLoading(prev => ({ ...prev, [actionName]: true }))
    
    console.log(data)
    try {
      const response = await fetch(`${BACKEND_URL}/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${actionName}`)
      }

      
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      console.error(error.message)
    } finally {
      setLoading(prev => ({ ...prev, [actionName]: false }))
    }
  }

  const startLiveTracking = () => {
    const interval = setInterval(async () => {
      try {
        await fetch(`${BACKEND_URL}/api/admin/fantasy-points-live`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(liveTrackingData),
        })
      } catch (error) {
        console.error('Live tracking error:', error)
      }
    }, 60000) // 1 minute

    setLiveTrackingInterval(interval)
    setLiveTracking(true)
  }

  const stopLiveTracking = () => {
    if (liveTrackingInterval) {
      clearInterval(liveTrackingInterval)
      setLiveTrackingInterval(null)
    }
    setLiveTracking(false)
  }

  useEffect(() => {
    return () => {
      if (liveTrackingInterval) {
        clearInterval(liveTrackingInterval)
      }
    }
  }, [liveTrackingInterval])

  const isFormValid = (data: Record<string, string>) => {
    return Object.values(data).every((value: string) => value.trim() !== '')
  }

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your fantasy football data updates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Fantasy Draft Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Update Fantasy Draft
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="draft-year">Year</Label>
              <Input 
                id="draft-year" 
                value={fantasyDraft.year} 
                onChange={(e) => setFantasyDraft(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
              />
            </div>
            <div>
              <Label htmlFor="draft-league">League ID</Label>
              <Input 
                id="draft-league" 
                value={fantasyDraft.leagueId} 
                onChange={(e) => setFantasyDraft(prev => ({ ...prev, leagueId: e.target.value }))}
                placeholder="League ID"
              />
            </div>
            <div>
              <Label htmlFor="draft-swid">SWID</Label>
              <Input 
                id="draft-swid" 
                value={fantasyDraft.swid} 
                onChange={(e) => setFantasyDraft(prev => ({ ...prev, swid: e.target.value }))}
                placeholder="SWID"
              />
            </div>
            <div>
              <Label htmlFor="draft-espns2">ESPN S2</Label>
              <Input 
                id="draft-espns2" 
                value={fantasyDraft.espnS2} 
                onChange={(e) => setFantasyDraft(prev => ({ ...prev, espnS2: e.target.value }))}
                placeholder="ESPN S2 Token"
              />
            </div>
            <Button 
              onClick={() => handleConfirm(
                "Update Fantasy Draft",
                `Update fantasy draft data for ${fantasyDraft.year}?`,
                () => executeAction('Update Fantasy Draft', 'updateFantasyDraftData', fantasyDraft)
              )}
              disabled={!isFormValid(fantasyDraft) || loading['Update Fantasy Draft']}
              className="w-full"
            >
              {loading['Update Fantasy Draft'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Fantasy Draft
            </Button>
          </CardContent>
        </Card>

        {/* League Rosters Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Update League Rosters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rosters-year">Year</Label>
              <Input 
                id="rosters-year" 
                value={leagueRosters.year} 
                onChange={(e) => setLeagueRosters(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
              />
            </div>
            <div>
              <Label htmlFor="rosters-league">League ID</Label>
              <Input 
                id="rosters-league" 
                value={leagueRosters.leagueId} 
                onChange={(e) => setLeagueRosters(prev => ({ ...prev, leagueId: e.target.value }))}
                placeholder="League ID"
              />
            </div>
            <div>
              <Label htmlFor="rosters-swid">SWID</Label>
              <Input 
                id="rosters-swid" 
                value={leagueRosters.swid} 
                onChange={(e) => setLeagueRosters(prev => ({ ...prev, swid: e.target.value }))}
                placeholder="SWID"
              />
            </div>
            <div>
              <Label htmlFor="rosters-espns2">ESPN S2</Label>
              <Input 
                id="rosters-espns2" 
                value={leagueRosters.espnS2} 
                onChange={(e) => setLeagueRosters(prev => ({ ...prev, espnS2: e.target.value }))}
                placeholder="ESPN S2 Token"
              />
            </div>
            <Button 
              onClick={() => handleConfirm(
                "Update League Rosters",
                `Update league rosters for ${leagueRosters.year}?`,
                () => executeAction('Update League Rosters', 'updateLeagueCurrentRosters', leagueRosters)
              )}
              disabled={!isFormValid(leagueRosters) || loading['Update League Rosters']}
              className="w-full"
            >
              {loading['Update League Rosters'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update League Rosters
            </Button>
          </CardContent>
        </Card>

        {/* Big Play Data Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Update Big Play Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bigplay-week">Week</Label>
                <Input 
                  id="bigplay-week" 
                  value={bigPlayData.week} 
                  onChange={(e) => setBigPlayData(prev => ({ ...prev, week: e.target.value }))}
                  placeholder="1-18"
                />
              </div>
              <div>
                <Label htmlFor="bigplay-year">Year</Label>
                <Input 
                  id="bigplay-year" 
                  value={bigPlayData.year} 
                  onChange={(e) => setBigPlayData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2024"
                />
              </div>
            </div>
            <Button 
              onClick={() => handleConfirm(
                "Update Big Play Data",
                `Update big play data for Week ${bigPlayData.week}, ${bigPlayData.year}?`,
                () => executeAction('Update Big Play Data', 'big-play-data', bigPlayData)
              )}
              disabled={!isFormValid(bigPlayData) || loading['Update Big Play Data']}
              className="w-full"
            >
              {loading['Update Big Play Data'] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Big Play Data
            </Button>
          </CardContent>
        </Card>

        {/* Live Fantasy Points Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Fantasy Points Live Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="live-week">Week</Label>
                <Input 
                  id="live-week" 
                  value={liveTrackingData.week} 
                  onChange={(e) => setLiveTrackingData(prev => ({ ...prev, week: e.target.value }))}
                  placeholder="1-18"
                />
              </div>
              <div>
                <Label htmlFor="live-year">Year</Label>
                <Input 
                  id="live-year" 
                  value={liveTrackingData.year} 
                  onChange={(e) => setLiveTrackingData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2024"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="live-league">League ID</Label>
              <Input 
                id="live-league" 
                value={liveTrackingData.leagueId} 
                onChange={(e) => setLiveTrackingData(prev => ({ ...prev, leagueId: e.target.value }))}
                placeholder="League ID"
              />
            </div>
            <div>
              <Label htmlFor="live-swid">SWID</Label>
              <Input 
                id="live-swid" 
                value={liveTrackingData.swid} 
                onChange={(e) => setLiveTrackingData(prev => ({ ...prev, swid: e.target.value }))}
                placeholder="SWID"
              />
            </div>
            <div>
              <Label htmlFor="live-espns2">ESPN S2</Label>
              <Input 
                id="live-espns2" 
                value={liveTrackingData.espnS2} 
                onChange={(e) => setLiveTrackingData(prev => ({ ...prev, espnS2: e.target.value }))}
                placeholder="ESPN S2 Token"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="live-tracking-toggle" 
                checked={liveTracking}
                onCheckedChange={(checked) => {
                  if (checked) {
                    if (isFormValid(liveTrackingData)) {
                      handleConfirm(
                        "Start Live Tracking",
                        `Start live tracking for Week ${liveTrackingData.week}, ${liveTrackingData.year}? This will update every minute.`,
                        startLiveTracking
                      )
                    }
                  } else {
                    stopLiveTracking()
                  }
                }}
                disabled={!isFormValid(liveTrackingData)}
              />
              <Label htmlFor="live-tracking-toggle">
                {liveTracking ? 'Live Tracking Active' : 'Enable Live Tracking'}
              </Label>
            </div>

            {liveTracking && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <Activity className="h-4 w-4 animate-pulse" />
                Live tracking active - updating every minute
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Window Manager */}
      <TimeWindowManager />

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setConfirmDialog(prev => ({ ...prev, open: false }))
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm()
              }
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}