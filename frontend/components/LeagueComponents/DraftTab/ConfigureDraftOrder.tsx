// /* eslint-disable @typescript-eslint/no-unused-vars */

// 'use client'
// import React, { useState } from 'react'
// import { DraftPosition, League } from '@/lib/interfaces'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { EditDraftOrderModal } from './EditDraftOrderModal'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// interface ConfigureDraftOrderProps {
//   league: League
//   teamId: string
//   year: number
//   draftOrder: DraftPosition[]
// }

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// export function ConfigureDraftOrder({ league, teamId, year, draftOrder }: ConfigureDraftOrderProps) {

//     const [modalOpen, setModalOpen] = useState(false);

//     const getTeamInfo = (teamId: string) => {
//         const team = league.teams.find(t => t.id === teamId)
//         return {
//             team_name: team?.team_name,
//             team_abbrev: team?.team_abbrev
//         }
//     }

//     function calculateRoundAndPick(pickNumber: number, teamCount: number) {
//         const round = Math.ceil(pickNumber / teamCount)
//         let pick = pickNumber % teamCount
//         if (pick === 0) pick = teamCount
//         return { round, pick }
//     }

//     return (
//         <Card className="max-w-2xl w-1/2">
//           <CardHeader className="flex items-center justify-between">
//             <CardTitle>Draft Order</CardTitle>
//             <Button variant="outline" onClick={() => setModalOpen(true)}>
//               Edit Draft Order
//             </Button>
//           </CardHeader>

//           <CardContent className="overflow-x-auto max-h-[320px] overflow-y-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-16">Round - Pick</TableHead>
//                   <TableHead>Team</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {draftOrder.map((position) => {
//                   const team = getTeamInfo(position.team_id)
//                   return (
//                     <TableRow key={position.id}>
//                       <TableCell className="font-mono">Round {calculateRoundAndPick(position.pick_number, league.teams.length).round}, Pick {calculateRoundAndPick(position.pick_number, league.teams.length).pick} <Badge variant="outline">{position.pick_number}</Badge></TableCell>
//                       <TableCell>{team?.team_name || 'Unknown'}</TableCell>
//                     </TableRow>
//                   )
//                 })}
//               </TableBody>
//             </Table>
//           </CardContent>
    
//           <EditDraftOrderModal
//             league={league}
//             open={modalOpen}
//             onClose={() => setModalOpen(false)}
//             year={year}
//           />
//         </Card>
//       )
    
// }