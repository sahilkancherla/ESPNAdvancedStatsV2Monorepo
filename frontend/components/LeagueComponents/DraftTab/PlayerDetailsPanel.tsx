// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// 'use client'
// import React from 'react'
// import { NFLPlayer } from '@/lib/interfaces'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// interface PlayerDetailsPanelProps {
//   nflPlayer: NFLPlayer
//   statsAndProjectedBreakdown: any
//   nflTeams: NFLTeam[]
//   myTeam: DraftPick[]
// }

// type StatTableRow = {
//   label: string
//   projected: number | string
//   actual: number | string
//   suffix?: string
// }

// function round2(val: any) {
//   if (typeof val === 'number') {
//     return val.toFixed(2)
//   }
//   return val
// }

// function getQBStatRows(projected: any, actual: any, overallPointsAndProjections: any): StatTableRow[] {
//   return [
//     {
//       label: 'Fantasy Points',
//       projected: overallPointsAndProjections?.current_season_projected_points_total !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_total) : '-',
//       actual: overallPointsAndProjections?.last_season_points_total !== undefined ? round2(overallPointsAndProjections.last_season_points_total) : '---',
//     },
//     {
//       label: 'Fantasy Points/Game',
//       projected: overallPointsAndProjections?.current_season_projected_points_per_game !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_per_game) : '-',
//       actual: overallPointsAndProjections?.last_season_points_per_game !== undefined ? round2(overallPointsAndProjections.last_season_points_per_game) : '---',
//     },
//     {
//       label: 'Passing Yards',
//       projected: projected?.passingYards !== undefined ? round2(projected.passingYards) * 17 : '-',
//       actual: actual?.passingYards !== undefined ? round2(actual.passingYards) * 17 : '---',
//     },
//     {
//       label: 'Passing Yards/Game',
//       projected: projected?.passingYards !== undefined ? round2(projected.passingYards) : '-',
//       actual: actual?.passingYards !== undefined ? round2(actual.passingYards) : '---',
//     },
//     {
//       label: 'Passing TDs',
//       projected: projected?.passingTouchdowns !== undefined ? round2(projected.passingTouchdowns) : '-',
//       actual: actual?.passingTouchdowns !== undefined ? round2(actual.passingTouchdowns) : '---',
//     },
//     {
//       label: 'Interceptions',
//       projected: projected?.passingInterceptions !== undefined ? round2(projected.passingInterceptions) : '-',
//       actual: actual?.passingInterceptions !== undefined ? round2(actual.passingInterceptions) : '---',
//     },
//     {
//       label: 'Completion %',
//       projected:
//         projected && projected.passingAttempts > 0
//           ? ((projected.passingCompletions / projected.passingAttempts) * 100).toFixed(2)
//           : '-',
//       actual:
//         actual && actual.passingAttempts > 0
//           ? ((actual.passingCompletions / actual.passingAttempts) * 100).toFixed(2)
//           : '---',
//       suffix: '%',
//     },
//     {
//       label: 'Rushing Yards',
//       projected: projected?.rushingYards !== undefined ? round2(projected.rushingYards) * 17 : '-',
//       actual: actual?.rushingYards !== undefined ? round2(actual.rushingYards) * 17 : '---',
//     },
//     {
//       label: 'Rushing Yards/Game',
//       projected: projected?.rushingYards !== undefined ? round2(projected.rushingYards) : '-',
//       actual: actual?.rushingYards !== undefined ? round2(actual.rushingYards) : '---',
//     },
//     {
//       label: 'Rushing TDs',
//       projected: projected?.rushingTouchdowns !== undefined ? round2(projected.rushingTouchdowns) : '-',
//       actual: actual?.rushingTouchdowns !== undefined ? round2(actual.rushingTouchdowns) : '---',
//     },
//   ]
// }

// function getRBStatRows(projected: any, actual: any, overallPointsAndProjections: any): StatTableRow[] {
//   return [
//     {
//       label: 'Fantasy Points',
//       projected: overallPointsAndProjections?.current_season_projected_points_total !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_total) : '-',
//       actual: overallPointsAndProjections?.last_season_points_total !== undefined ? round2(overallPointsAndProjections.last_season_points_total) : '---',
//     },
//     {
//       label: 'Fantasy Points/Game',
//       projected: overallPointsAndProjections?.current_season_projected_points_per_game !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_per_game) : '-',
//       actual: overallPointsAndProjections?.last_season_points_per_game !== undefined ? round2(overallPointsAndProjections.last_season_points_per_game) : '---',
//     },
//     {
//       label: 'Rushing Yards',
//       projected: projected?.rushingYards !== undefined ? round2(projected.rushingYards * 17) : '-',
//       actual: actual?.rushingYards !== undefined ? round2(actual.rushingYards * 17) : '---',
//     },
//     {
//       label: 'Rushing Yards/Game',
//       projected: projected?.rushingYards !== undefined ? round2(projected.rushingYards) : '-',
//       actual: actual?.rushingYards !== undefined ? round2(actual.rushingYards) : '---',
//     },
//     {
//       label: 'Rushing TDs',
//       projected: projected?.rushingTouchdowns !== undefined ? round2(projected.rushingTouchdowns) : '-',
//       actual: actual?.rushingTouchdowns !== undefined ? round2(actual.rushingTouchdowns) : '---',
//     },
//     {
//       label: 'Rushing Attempts',
//       projected: projected?.rushingAttempts !== undefined ? round2(projected.rushingAttempts) : '-',
//       actual: actual?.rushingAttempts !== undefined ? round2(actual.rushingAttempts) : '---',
//     },
//     {
//       label: 'Receiving Yards',
//       projected: projected?.receivingYards !== undefined ? round2(projected.receivingYards * 17) : '-',
//       actual: actual?.receivingYards !== undefined ? round2(actual.receivingYards * 17) : '---',
//     },
//     {
//       label: 'Receiving Yards/Game',
//       projected: projected?.receivingYards !== undefined ? round2(projected.receivingYards) : '-',
//       actual: actual?.receivingYards !== undefined ? round2(actual.receivingYards) : '---',
//     },
//     {
//       label: 'Receiving TDs',
//       projected: projected?.receivingTouchdowns !== undefined ? round2(projected.receivingTouchdowns) : '-',
//       actual: actual?.receivingTouchdowns !== undefined ? round2(actual.receivingTouchdowns) : '---',
//     },
//     {
//       label: 'Receptions',
//       projected: projected?.receivingReceptions !== undefined ? round2(projected.receivingReceptions) : '-',
//       actual: actual?.receivingReceptions !== undefined ? round2(actual.receivingReceptions) : '---',
//     },
//     {
//       label: 'Targets',
//       projected: projected?.receivingTargets !== undefined ? round2(projected.receivingTargets) : '-',
//       actual: actual?.receivingTargets !== undefined ? round2(actual.receivingTargets) : '---',
//     },
//   ]
// }

// function getWRTEStatRows(projected: any, actual: any, overallPointsAndProjections: any): StatTableRow[] {
//   return [
//     {
//       label: 'Fantasy Points',
//       projected: overallPointsAndProjections?.current_season_projected_points_total !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_total) : '-',
//       actual: overallPointsAndProjections?.last_season_points_total !== undefined ? round2(overallPointsAndProjections.last_season_points_total) : '---',
//     },
//     {
//       label: 'Fantasy Points/Game',
//       projected: overallPointsAndProjections?.current_season_projected_points_per_game !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_per_game) : '-',
//       actual: overallPointsAndProjections?.last_season_points_per_game !== undefined ? round2(overallPointsAndProjections.last_season_points_per_game) : '---',
//     },
//     {
//       label: 'Receiving Yards',
//       projected: projected?.receivingYards !== undefined ? round2(projected.receivingYards * 17) : '-',
//       actual: actual?.receivingYards !== undefined ? round2(actual.receivingYards * 17) : '---',
//     },
//     {
//       label: 'Receiving Yards/Game',
//       projected: projected?.receivingYards !== undefined ? round2(projected.receivingYards) : '-',
//       actual: actual?.receivingYards !== undefined ? round2(actual.receivingYards) : '---',
//     },
//     {
//       label: 'Receiving TDs',
//       projected: projected?.receivingTouchdowns !== undefined ? round2(projected.receivingTouchdowns) : '-',
//       actual: actual?.receivingTouchdowns !== undefined ? round2(actual.receivingTouchdowns) : '---',
//     },
//     {
//       label: 'Receptions',
//       projected: projected?.receivingReceptions !== undefined ? round2(projected.receivingReceptions) : '-',
//       actual: actual?.receivingReceptions !== undefined ? round2(actual.receivingReceptions) : '---',
//     },
//     {
//       label: 'Targets',
//       projected: projected?.receivingTargets !== undefined ? round2(projected.receivingTargets) : '-',
//       actual: actual?.receivingTargets !== undefined ? round2(actual.receivingTargets) : '---',
//     },
//   ]
// }

// function getKStatRows(projected: any, actual: any, overallPointsAndProjections: any): StatTableRow[] {
//   return [
//     {
//       label: 'Fantasy Points',
//       projected: overallPointsAndProjections?.current_season_projected_points_total !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_total) : '-',
//       actual: overallPointsAndProjections?.last_season_points_total !== undefined ? round2(overallPointsAndProjections.last_season_points_total) : '---',
//     },
//     {
//       label: 'Fantasy Points/Game',
//       projected: overallPointsAndProjections?.current_season_projected_points_per_game !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_per_game) : '-',
//       actual: overallPointsAndProjections?.last_season_points_per_game !== undefined ? round2(overallPointsAndProjections.last_season_points_per_game) : '---',
//     },
//     {
//       label: 'Field Goals Made',
//       projected: projected?.fieldGoalsMade !== undefined ? round2(projected.fieldGoalsMade) : '-',
//       actual: actual?.fieldGoalsMade !== undefined ? round2(actual.fieldGoalsMade) : '---',
//     },
//     {
//       label: 'FG Attempted',
//       projected: projected?.fieldGoalsAttempted !== undefined ? round2(projected.fieldGoalsAttempted) : '-',
//       actual: actual?.fieldGoalsAttempted !== undefined ? round2(actual.fieldGoalsAttempted) : '---',
//     },
//     {
//       label: 'Extra Points Made',
//       projected: projected?.extraPointsMade !== undefined ? round2(projected.extraPointsMade) : '-',
//       actual: actual?.extraPointsMade !== undefined ? round2(actual.extraPointsMade) : '---',
//     },
//     {
//       label: 'XP Attempted',
//       projected: projected?.extraPointsAttempted !== undefined ? round2(projected.extraPointsAttempted) : '-',
//       actual: actual?.extraPointsAttempted !== undefined ? round2(actual.extraPointsAttempted) : '---',
//     },
//     {
//       label: 'FG Accuracy',
//       projected:
//         projected && projected.fieldGoalsAttempted > 0
//           ? ((projected.fieldGoalsMade / projected.fieldGoalsAttempted) * 100).toFixed(2)
//           : '-',
//       actual:
//         actual && actual.fieldGoalsAttempted > 0
//           ? ((actual.fieldGoalsMade / actual.fieldGoalsAttempted) * 100).toFixed(2)
//           : '---',
//       suffix: '%',
//     },
//     {
//       label: 'XP Accuracy',
//       projected:
//         projected && projected.extraPointsAttempted > 0
//           ? ((projected.extraPointsMade / projected.extraPointsAttempted) * 100).toFixed(2)
//           : '-',
//       actual:
//         actual && actual.extraPointsAttempted > 0
//           ? ((actual.extraPointsMade / actual.extraPointsAttempted) * 100).toFixed(2)
//           : '---',
//       suffix: '%',
//     },
//   ]
// }

// function getDSTStatRows(projected: any, actual: any, overallPointsAndProjections: any): StatTableRow[] {
//   return [
//     {
//       label: 'Fantasy Points',
//       projected: overallPointsAndProjections?.current_season_projected_points_total !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_total) : '-',
//       actual: overallPointsAndProjections?.last_season_points_total !== undefined ? round2(overallPointsAndProjections.last_season_points_total) : '---',
//     },
//     {
//       label: 'Fantasy Points/Game',
//       projected: overallPointsAndProjections?.current_season_projected_points_per_game !== undefined ? round2(overallPointsAndProjections.current_season_projected_points_per_game) : '-',
//       actual: overallPointsAndProjections?.last_season_points_per_game !== undefined ? round2(overallPointsAndProjections.last_season_points_per_game) : '---',
//     },
//     {
//       label: 'Defensive TDs',
//       projected: projected?.defensiveTouchdowns !== undefined ? round2(projected.defensiveTouchdowns) : '-',
//       actual: actual?.defensiveTouchdowns !== undefined ? round2(actual.defensiveTouchdowns) : '---',
//     },
//     {
//       label: 'Interceptions',
//       projected: projected?.defensiveInterceptions !== undefined ? round2(projected.defensiveInterceptions) : '-',
//       actual: actual?.defensiveInterceptions !== undefined ? round2(actual.defensiveInterceptions) : '---',
//     },
//     {
//       label: 'Sacks',
//       projected: projected?.defensiveSacks !== undefined ? round2(projected.defensiveSacks) : '-',
//       actual: actual?.defensiveSacks !== undefined ? round2(actual.defensiveSacks) : '---',
//     },
//     {
//       label: 'Safeties',
//       projected: projected?.defensiveSafeties !== undefined ? round2(projected.defensiveSafeties) : '-',
//       actual: actual?.defensiveSafeties !== undefined ? round2(actual.defensiveSafeties) : '---',
//     },
//     {
//       label: 'Defensive Points',
//       projected: projected?.defensivePoints !== undefined ? round2(projected.defensivePoints) : '-',
//       actual: actual?.defensivePoints !== undefined ? round2(actual.defensivePoints) : '---',
//     },
//   ]
// }

// const getPositionColor = (pos: string) => {
//   const colors = {
//     'QB': 'bg-purple-100 text-purple-800',
//     'RB': 'bg-green-100 text-green-800',
//     'WR': 'bg-blue-100 text-blue-800',
//     'TE': 'bg-orange-100 text-orange-800',
//     'K': 'bg-yellow-100 text-yellow-800',
//     'D/ST': 'bg-gray-100 text-gray-800'
//   }
//   return colors[pos] || 'bg-gray-100 text-gray-800'
// }

// export function PlayerDetailsPanel({ nflPlayer, statsAndProjectedBreakdown, nflTeams, myTeam}: PlayerDetailsPanelProps) {
//   const espnPlayerIdString = nflPlayer.espn_player_id?.toString?.() ?? ''
//   const position = nflPlayer.position
//   const playerTeam = nflTeams.find(team => team.id === nflPlayer?.team_id)
//   const schedule = playerTeam?.schedule
//   const playerByeWeek = playerTeam?.bye_week

//   console.log(myTeam)
//   console.log(playerByeWeek)

//   // Defensive: fail-safes for missing or undefined data
//   let projectedBreakdown: any = undefined
//   let lastSeasonActual: any = undefined
//   let overallPointsAndProjections: any = undefined

//   // Defensive: check for statsAndProjectedBreakdown and its keys
//   if (
//     statsAndProjectedBreakdown &&
//     statsAndProjectedBreakdown.current_season_projected_breakdown &&
//     typeof statsAndProjectedBreakdown.current_season_projected_breakdown === 'object'
//   ) {
//     projectedBreakdown = statsAndProjectedBreakdown.current_season_projected_breakdown[espnPlayerIdString]
//   }

//   if (
//     statsAndProjectedBreakdown &&
//     statsAndProjectedBreakdown.last_season_weekly_stats &&
//     typeof statsAndProjectedBreakdown.last_season_weekly_stats === 'object'
//   ) {
//     const playerWeeklyStats = statsAndProjectedBreakdown.last_season_weekly_stats[espnPlayerIdString]
//     if (playerWeeklyStats && typeof playerWeeklyStats === 'object' && playerWeeklyStats["0"] && typeof playerWeeklyStats["0"] === 'object') {
//       lastSeasonActual = playerWeeklyStats["0"]["breakdown"]
//     } else {
//       lastSeasonActual = undefined
//     }
//   }

//   if (
//     statsAndProjectedBreakdown &&
//     statsAndProjectedBreakdown.projections &&
//     typeof statsAndProjectedBreakdown.projections === 'object'
//   ) {
//     overallPointsAndProjections = statsAndProjectedBreakdown.projections[espnPlayerIdString]
//   }

//   let statRows: StatTableRow[] = []
//   if (position === 'QB') {
//     statRows = getQBStatRows(projectedBreakdown, lastSeasonActual, overallPointsAndProjections)
//   } else if (position === 'RB') {
//     statRows = getRBStatRows(projectedBreakdown, lastSeasonActual, overallPointsAndProjections)
//   } else if (position === 'WR' || position === 'TE') {
//     statRows = getWRTEStatRows(projectedBreakdown, lastSeasonActual, overallPointsAndProjections)
//   } else if (position === 'K') {
//     statRows = getKStatRows(projectedBreakdown, lastSeasonActual, overallPointsAndProjections)
//   } else if (position === 'D/ST') {
//     statRows = getDSTStatRows(projectedBreakdown, lastSeasonActual, overallPointsAndProjections)
//   }

//   // If statRows is empty, show a fallback row
//   const hasStatRows = statRows && statRows.length > 0

//   // Calculate average strength of schedule
//   const calculateAverageStrength = () => {
//     if (!schedule || schedule.length === 0) return "---";
    
//     let totalStrength = 0;
//     let gameCount = 0;
    
//     schedule.forEach(game => {
//       const isAway = game.away_team_id === nflPlayer.team_id;
//       const opponentId = isAway ? game.home_team_id : game.away_team_id;
//       const opponentTeam = nflTeams.find(team => team.id === opponentId);
      
//       if (opponentTeam) {
//         let strengthRating = null;
        
//         // QB: average of safety and cornerback rankings
//         if (position === 'QB') {
//           const safetyRank = opponentTeam.espn_defense_s_ranking;
//           const cbRank = opponentTeam.espn_defense_cb_ranking;
//           if (safetyRank && cbRank) {
//             strengthRating = Math.round((safetyRank + cbRank) / 2);
//           }
//         }
//         // RB: average of PFF defensive line and ESPN DT rankings
//         else if (position === 'RB') {
//           const pffDefLineRank = opponentTeam.pff_defensive_line_ranking;
//           const espnDtRank = opponentTeam.espn_defense_dt_ranking;
//           if (pffDefLineRank && espnDtRank) {
//             strengthRating = Math.round((pffDefLineRank + espnDtRank) / 2);
//           }
//         }
//         // WR: cornerback ranking
//         else if (position === 'WR') {
//           strengthRating = opponentTeam.espn_defense_cb_ranking;
//         }
//         // TE: average of safety and linebacker rankings
//         else if (position === 'TE') {
//           const safetyRank = opponentTeam.espn_defense_s_ranking;
//           const lbRank = opponentTeam.espn_defense_lb_ranking;
//           if (safetyRank && lbRank) {
//             strengthRating = Math.round((safetyRank + lbRank) / 2);
//           }
//         }
        
//         if (strengthRating !== null) {
//           totalStrength += strengthRating;
//           gameCount++;
//         }
//       }
//     });
    
//     return gameCount > 0 ? (totalStrength / gameCount).toFixed(1) : "---";
//   };

//   const averageStrength = calculateAverageStrength();

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Player Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {nflPlayer.first_name} {nflPlayer.last_name}
//           </h1>
//           <div className="flex items-center gap-4">
//             <span className="text-lg text-gray-600 font-medium">{nflPlayer.team_abbrev}</span>
//             <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPositionColor(position)}`}>
//               {position}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Horizontal Table Format Stats using shadcn table */}
//       <div className="text-xl font-bold text-gray-900">
//         Season Stats & Projections
//       </div>

//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="text-left text-sm font-semibold text-gray-700"> </TableHead>
//               {hasStatRows ? (
//                 statRows.map((row, idx) => (
//                   <TableHead
//                     key={row.label}
//                     className={`text-center text-sm font-semibold text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
//                   >
//                     {row.label}
//                   </TableHead>
//                 ))
//               ) : (
//                 <TableHead className="text-center text-sm font-semibold text-gray-700 bg-white">
//                   No Data
//                 </TableHead>
//               )}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             <TableRow>
//               <TableCell className="font-semibold text-gray-700 text-left">2025 Projected</TableCell>
//               {hasStatRows ? (
//                 statRows.map((row, idx) => (
//                   <TableCell
//                     key={row.label + '-projected'}
//                     className={`text-center font-bold text-gray-900 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
//                   >
//                     {row.projected !== undefined && row.projected !== null ? row.projected : '---'}
//                     {row.suffix ? row.suffix : ''}
//                   </TableCell>
//                 ))
//               ) : (
//                 <TableCell className="text-center font-bold text-gray-900 bg-white">
//                   ---
//                 </TableCell>
//               )}
//             </TableRow>
//             <TableRow>
//               <TableCell className="font-semibold text-gray-700 text-left">2024 Actual</TableCell>
//               {hasStatRows ? (
//                 statRows.map((row, idx) => (
//                   <TableCell
//                     key={row.label + '-actual'}
//                     className={`text-center text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
//                   >
//                     {row.actual !== undefined && row.actual !== null ? row.actual : '---'}
//                     {row.suffix ? row.suffix : ''}
//                   </TableCell>
//                 ))
//               ) : (
//                 <TableCell className="text-center text-gray-700 bg-white">
//                   ---
//                 </TableCell>
//               )}
//             </TableRow>
//           </TableBody>
//         </Table>
//       </div>

//       {/* Volume Metrics */}
//       <div className="text-xl font-bold text-gray-900">
//         Volume Metrics
//       </div>

//       <div className="text-xl font-bold text-gray-900">
//         2024 Game Log
//       </div>

//       <div className="text-xl font-bold text-gray-900">
//         Strength of Schedule
//         <div className="text-sm font-normal text-gray-600 mt-1">
//           Average Strength: {averageStrength}
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//       <Table>
//         <TableHeader>
//             <TableRow>
//             <TableHead className="text-left font-semibold text-gray-700">Stat</TableHead>
//             {schedule && schedule.length > 0 ? (
//                 (() => {
//                     const maxWeek = Math.max(...schedule.map(g => g.week), playerByeWeek || 0);
//                     return Array.from({ length: maxWeek }, (_, i) => i + 1).map((week) => (
//                         <TableHead key={week} className="text-center font-semibold text-gray-700">
//                             Week {week}
//                         </TableHead>
//                     ));
//                 })()
//             ) : (
//                 <TableHead className="text-center font-semibold text-gray-700">No Data</TableHead>
//             )}
//             </TableRow>
//         </TableHeader>

//         <TableBody>
//             {/* Opponent Row */}
//             <TableRow>
//             <TableCell className="font-semibold text-gray-700 text-left bg-white">Opponent</TableCell>
//             {schedule && schedule.length > 0 ? (
//                 Array.from({ length: Math.max(...schedule.map(g => g.week), playerByeWeek || 0) }, (_, i) => i + 1).map((week, idx) => {
//                 if (week === playerByeWeek) return (
//                     <TableCell key={week} className={`text-center text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     BYE
//                     </TableCell>
//                 );

//                 const game = schedule.find(g => g.week === week);
//                 let opponentDisplay = "---";
//                 if (game) {
//                     const isAway = game.away_team_id === nflPlayer.team_id;
//                     const opponentId = isAway ? game.home_team_id : game.away_team_id;
//                     const opponentAbbrev = nflTeams.find(team => team.id === opponentId)?.team_abbrev || "";
//                     opponentDisplay = isAway ? `@${opponentAbbrev}` : opponentAbbrev;
//                 }

//                 return (
//                     <TableCell key={week} className={`text-center text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     {opponentDisplay}
//                     </TableCell>
//                 );
//                 })
//             ) : (
//                 <TableCell className="text-center text-gray-500 bg-white">No schedule data available</TableCell>
//             )}
//             </TableRow>

//             {/* Opponent Strength Row */}
//             <TableRow>
//             <TableCell className="font-semibold text-gray-700 text-left bg-white">Strength</TableCell>
//             {schedule && schedule.length > 0 ? (
//                 Array.from({ length: Math.max(...schedule.map(g => g.week), playerByeWeek || 0) }, (_, i) => i + 1).map((week, idx) => {
//                 if (week === playerByeWeek) return (
//                     <TableCell key={week} className={`text-center text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     BYE
//                     </TableCell>
//                 );

//                 const game = schedule.find(g => g.week === week);
//                 let opponentDisplay = "---";

//                 if (game) {
//                     const isAway = game.away_team_id === nflPlayer.team_id;
//                     const opponentId = isAway ? game.home_team_id : game.away_team_id;
//                     const opponentTeam = nflTeams.find(team => team.id === opponentId);
                    
//                     if (opponentTeam) {
//                         let strengthRating = null;
                        
//                         // QB: average of safety and cornerback rankings
//                         if (position === 'QB') {
//                             const safetyRank = opponentTeam.espn_defense_s_ranking;
//                             const cbRank = opponentTeam.espn_defense_cb_ranking;
//                             if (safetyRank && cbRank) {
//                                 strengthRating = Math.round((safetyRank + cbRank) / 2);
//                             }
//                         }
//                         // RB: average of PFF defensive line and ESPN DT rankings
//                         else if (position === 'RB') {
//                             const pffDefLineRank = opponentTeam.pff_defensive_line_ranking;
//                             const espnDtRank = opponentTeam.espn_defense_dt_ranking;
//                             if (pffDefLineRank && espnDtRank) {
//                                 strengthRating = Math.round((pffDefLineRank + espnDtRank) / 2);
//                             }
//                         }
//                         // WR: cornerback ranking
//                         else if (position === 'WR') {
//                             strengthRating = opponentTeam.espn_defense_cb_ranking;
//                         }
//                         // TE: average of safety and linebacker rankings
//                         else if (position === 'TE') {
//                             const safetyRank = opponentTeam.espn_defense_s_ranking;
//                             const lbRank = opponentTeam.espn_defense_lb_ranking;
//                             if (safetyRank && lbRank) {
//                                 strengthRating = Math.round((safetyRank + lbRank) / 2);
//                             }
//                         }
                        
//                         opponentDisplay = strengthRating ? strengthRating.toString() : "---";
//                     }
//                 }
                

//                 const getRankingColor = (ranking: string) => {
//                     if (ranking === "---" || ranking === "BYE") return "";
//                     const rank = parseInt(ranking);
//                     if (rank <= 8) return "bg-red-500 text-white";
//                     if (rank <= 16) return "bg-orange-500 text-white";
//                     if (rank <= 24) return "bg-yellow-500 text-white";
//                     return "bg-green-500 text-white";
//                 };

//                 return (
//                     <TableCell key={week} className={`text-center ${getRankingColor(opponentDisplay)} ${opponentDisplay === "---" ? `text-gray-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}` : ''}`}>
//                     {opponentDisplay}
//                     </TableCell>
//                 );
//                 })
//             ) : (
//                 <TableCell className="text-center text-gray-500 bg-white">No schedule data available</TableCell>
//             )}
//             </TableRow>
//         </TableBody>
//         </Table>


//       </div>

//       <div className="text-xl font-bold text-gray-900">
//         Bye Week
//       </div>

//         <div className="space-y-2">
//           {(() => {
//             // Find the week when the current player has a bye
//             const currentPlayerTeam = nflTeams.find(team => team.id === nflPlayer.team_id);
//             const currentPlayerByeWeek = currentPlayerTeam?.bye_week;
            
//             if (!currentPlayerByeWeek) {
//               return (
//                 <div className="text-gray-500 text-sm">
//                   No bye week information available for this player.
//                 </div>
//               );
//             }
            
//             const playersOnBye = [];
            
//             if (myTeam) {
//               // Find all players on my team who have a bye this week
//               const myTeamPlayers = Array.isArray(myTeam) ? myTeam : [myTeam];
//               for (const player of myTeamPlayers) {
//                 if (player.team_id) {
//                   const playerNflTeam = nflTeams.find(team => team.id === player.team_id);
//                   if (playerNflTeam && playerNflTeam.bye_week === currentPlayerByeWeek) {
//                     playersOnBye.push(player);
//                   }
//                 }
//               }
//             }
            
//             // Check for warnings
//             let hasWarning = false;
//             let warningMessage = '';
            
//             // Check position conflicts - only warn if current player creates a duplicate
//             const existingPositions = playersOnBye.map(p => p.position);
//             const hasPositionConflict = existingPositions.includes(nflPlayer.position);
            
//             // Check player count - only warn if adding current player reaches threshold
//             const totalPlayersWithCurrent = playersOnBye.length + 1;
//             const hasHighPlayerCount = totalPlayersWithCurrent >= 3;
            
//             // Check for special position conflicts (QB/TE, QB/K, TE/K)
//             const hasSpecialPositionConflict = 
//               (nflPlayer.position === 'QB' && existingPositions.some(pos => pos === 'TE' || pos === 'K')) ||
//               (nflPlayer.position === 'TE' && existingPositions.some(pos => pos === 'QB' || pos === 'K')) ||
//               (nflPlayer.position === 'K' && existingPositions.some(pos => pos === 'QB' || pos === 'TE'));
            
//             if (hasPositionConflict && hasHighPlayerCount) {
//               hasWarning = true;
//               warningMessage = ` (${totalPlayersWithCurrent} players, Position conflicts)`;
//             } else if (hasPositionConflict) {
//               hasWarning = true;
//               warningMessage = ' (Position conflict)';
//             } else if (hasSpecialPositionConflict) {
//               hasWarning = true;
//               warningMessage = ' (Rare position conflict)';
//             } else if (hasHighPlayerCount) {
//               hasWarning = true;
//               warningMessage = ` (${totalPlayersWithCurrent} players)`;
//             }
            
//             return (
//               <div className={`flex items-center gap-2 p-2 border rounded ${hasWarning ? 'border-amber-300 bg-amber-50' : ''}`}>
//                 <div className="font-medium flex items-center gap-2 h-8">
//                   Week {currentPlayerByeWeek}:
//                   {hasWarning && (
//                     <span className="text-amber-600 text-xs font-normal">
//                       {warningMessage}
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {playersOnBye.map(player => (
//                     <span 
//                       key={player.id} 
//                       className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700"
//                     >
//                       {player.first_name} {player.last_name} ({player.position})
//                     </span>
//                   ))}
//                   <span className="px-2 py-1 rounded text-sm bg-blue-200 text-blue-900 font-medium">
//                     {nflPlayer.first_name} {nflPlayer.last_name} ({nflPlayer.position})
//                   </span>
//                 </div>
//               </div>
//             );
//           })()}
//         </div>

//       <div className="text-xl font-bold text-gray-900">
//         Depth Chart
//       </div>

//       <div className="text-xl font-bold text-gray-900">
//         Snap Share
//       </div>

//       <div className="text-xl font-bold text-gray-900">
//         What&apos;s New?
//       </div>
//     </div>
//   )
// }