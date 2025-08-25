/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'
import { useState, JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter } from 'lucide-react'
import { useFantasyData } from '@/context/FantasyDataContext'
import { useNFLData } from '@/context/NFLDataContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useUser } from '@/context/UserContext'
import { PositionPlayerTiers } from './PositionPlayerTiers'


export function PlayerTiersContent() {
  const {currentYear} = useUser()
  const [selectedPosition, setSelectedPosition] = useState('qb')


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Player Tiers</h1>
          <p className="text-muted-foreground">{currentYear} Fantasy Football Player Tiers</p>
        </div>
      </div>


      {/* Tabs for Draft Analysis and Big Board */}
      <Tabs defaultValue={selectedPosition} className="w-full">
        <TabsList>
          <TabsTrigger value="qb">QB</TabsTrigger>
          <TabsTrigger value="rb">RB</TabsTrigger>
          <TabsTrigger value="wr">WR</TabsTrigger>
          <TabsTrigger value="te">TE</TabsTrigger>
        </TabsList>

        <TabsContent value="qb" className="pt-4">
          <PositionPlayerTiers position="QB" defaultTierSize={10} defaultGradingPlayersSize={1} />
        </TabsContent>

        <TabsContent value="rb" className="pt-4">
          <PositionPlayerTiers position="RB" defaultTierSize={10} defaultGradingPlayersSize={2} />
        </TabsContent>

        <TabsContent value="wr" className="pt-4">
          <PositionPlayerTiers position="WR" defaultTierSize={10} defaultGradingPlayersSize={2} />
        </TabsContent>

        <TabsContent value="te" className="pt-4">
          <PositionPlayerTiers position="TE" defaultTierSize={10} defaultGradingPlayersSize={1} />
        </TabsContent>
      </Tabs>
    </div>
  )
}