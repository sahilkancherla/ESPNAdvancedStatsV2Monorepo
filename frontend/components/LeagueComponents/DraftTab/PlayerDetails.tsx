// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// 'use client'
// import React, { useState, useMemo } from 'react'
// import { NFLPlayer } from '@/lib/interfaces'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
// import NFLPlayerComponent from '../NFLPlayer'
// import { Button } from '@/components/ui/button'
// import { PlayerDetailsPanel } from './PlayerDetailsPanel'

// interface PlayerDetailsProps {
//   nflPlayers: NFLPlayer[]
//   nflTeams: NFLTeam[]
//   statsAndProjectedBreakdown: any
//   myTeam: DraftPick[]
// }

// const positionsOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST']

// export function PlayerDetails({ nflPlayers, statsAndProjectedBreakdown, nflTeams, myTeam }: PlayerDetailsProps) {
//   const [search, setSearch] = useState('')
//   const [positionFilter, setPositionFilter] = useState<string | null>(null)
//   const [selectedPlayer, setSelectedPlayer] = useState<NFLPlayer | null>(null)

//   const filteredPlayers = useMemo(() => {
//     return nflPlayers
//       .filter(player => `${player.first_name} ${player.last_name}`.toLowerCase().includes(search.toLowerCase()))
//       .filter(player => (positionFilter ? player.position === positionFilter : true))
//       .sort((a, b) => {
//         // Sort by ADP (lower ADP = higher in the list)
//         const adpA = a.fp_adp_half_ppr_avg || 999
//         const adpB = b.fp_adp_half_ppr_avg || 999
//         return adpA - adpB
//       })
//   }, [search, positionFilter, nflPlayers])

//   const clearFilters = () => {
//     setSearch('')
//     setPositionFilter(null)
//   }

//   const formatADP = (adp: number | null | undefined) => {
//     if (!adp || adp === 1000) return 'Unranked'
//     return adp
//   }

//   const getADPColor = (adp: number | null | undefined) => {
//     if (!adp || adp === 0) return 'bg-gray-100 text-gray-600'
//     if (adp <= 24) return 'bg-green-100 text-green-800'
//     if (adp <= 48) return 'bg-yellow-100 text-yellow-800'
//     if (adp <= 96) return 'bg-orange-100 text-orange-800'
//     return 'bg-red-100 text-red-800'
//   }

//   return (
//     <Card className="w-full h-[600px] flex flex-col md:flex-row">
//       {/* Left Panel: Search + Filter + Player List */}
//       <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
//         <CardHeader className="pb-4">
//           <CardTitle className="text-lg font-semibold">Available Players</CardTitle>
          
//           {/* Search and Clear Button */}
//           <div className="flex gap-2 items-stretch">
//             <Input
//               placeholder="Search player..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               className="flex-1 h-9"
//             />
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={clearFilters}
//               className="px-3 h-9"
//             >
//               X
//             </Button>
//           </div>

//           {/* Position Filter */}
//           <Select onValueChange={value => setPositionFilter(value === 'all' ? null : value)} value={positionFilter || 'all'}>
//             <SelectTrigger>
//               <SelectValue placeholder="All positions" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All positions</SelectItem>
//               {positionsOrder.map(pos => (
//                 <SelectItem key={pos} value={pos}>{pos}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </CardHeader>

//         {/* Player List with Custom Scrolling */}
//         <div className="flex-1 overflow-hidden">
//           <div className="h-full overflow-y-auto px-4 pb-4">
//             {filteredPlayers.length === 0 ? (
//               <div className="text-center text-gray-500 py-8">
//                 No players found
//               </div>
//             ) : (
//               <div className="space-y-1">
//                 {filteredPlayers.map(player => (
//                   <div
//                     key={player.id}
//                     className={`
//                       p-3 rounded-md cursor-pointer transition-colors duration-150
//                       hover:bg-gray-100 
//                       ${selectedPlayer?.id === player.id ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'}
//                     `}
//                     onClick={() => setSelectedPlayer(player)}
//                   >
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium text-gray-900 truncate">
//                           {player.first_name} {player.last_name}
//                         </div>
//                         <div className="text-sm text-gray-500 mt-1">
//                           {player.team_abbrev}
//                         </div>
//                       </div>
//                       <div className="ml-2 flex flex-row items-center gap-2">
//                         {formatADP(player.fp_adp_half_ppr_avg) !== 'Unranked' && (
//                           <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-black">
//                             ADP: {formatADP(player.fp_adp_half_ppr_avg)}
//                           </span>
//                         )}
//                         <span className={`
//                           inline-flex px-2 py-1 text-xs font-medium rounded-full
//                           ${player.position === 'QB' ? 'bg-purple-100 text-purple-800' :
//                             player.position === 'RB' ? 'bg-green-100 text-green-800' :
//                             player.position === 'WR' ? 'bg-blue-100 text-blue-800' :
//                             player.position === 'TE' ? 'bg-orange-100 text-orange-800' :
//                             player.position === 'K' ? 'bg-yellow-100 text-yellow-800' :
//                             'bg-gray-100 text-gray-800'}
//                         `}>
//                           {player.position}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Right Panel: Player Details */}
//       <div className="w-full md:w-2/3 p-6 flex flex-col overflow-y-auto">
//         {selectedPlayer && statsAndProjectedBreakdown ? (
//           <div className="flex-1">
//             <PlayerDetailsPanel nflPlayer={selectedPlayer} statsAndProjectedBreakdown={statsAndProjectedBreakdown} nflTeams={nflTeams} myTeam={myTeam} />
//           </div>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="text-gray-400 text-lg mb-2">👤</div>
//               <div className="text-gray-500">Select a player to view details</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Card>
//   )
// }