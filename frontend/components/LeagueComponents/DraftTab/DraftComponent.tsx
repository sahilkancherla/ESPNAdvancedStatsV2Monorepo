// /* eslint-disable @typescript-eslint/no-explicit-any */

// 'use client'

// import React, { useEffect, useState } from 'react'
// import { NFLPlayer } from '@/lib/interfaces'
// import { BigBoard } from './BigBoard'
// import DraftBoard from './DraftBoard'
// import { ConfigureDraftOrder } from './ConfigureDraftOrder'
// import { PlayerDetails } from './PlayerDetails'

// interface DraftComponentProps {
//   league: League
//   teamId: string
//   nflPlayers: NFLPlayer[]
//   nflTeams: NFLTeam[]
//   statsAndProjectedBreakdown: any
//   year: number
// }

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

// export default function DraftComponent({
//   league,
//   teamId,
//   nflPlayers,
//   nflTeams,
//   statsAndProjectedBreakdown,
//   year,
// }: DraftComponentProps) {
//   const [draftPicks, setDraftPicks] = useState<DraftPick[]>([])
//   const [myTeam, setMyTeam] = useState<DraftPick[]>([])
//   const [draftOrder, setDraftOrder] = useState<DraftPosition[]>([])

//   const fetchDraftPicks = async () => {
//     const response = await fetch(
//       `${BACKEND_URL}/league/getLatestDraftPicks?leagueId=${league.id}&year=${year}`
//     )
//     const data = await response.json()

//     // Defensive: If data.draftPicks is an object (not array), convert to array
//     let picksArray: any[] = []
//     if (Array.isArray(data.draftPicks)) {
//       picksArray = data.draftPicks
//     } else if (typeof data.draftPicks === 'object' && data.draftPicks !== null) {
//       picksArray = Object.values(data.draftPicks)
//     }

//     const draftPicks: DraftPick[] = []
//     for (const pick of picksArray) {
//       const player = nflPlayers.find((player) => player.id === pick.nfl_player_id)
//       const draftedTeam = league.teams.find((team) => team.id === pick.team_id)
//       const draftedTeamName = draftedTeam?.team_name
//       const draftedTeamAbbrev = draftedTeam?.team_abbrev
//       if (player) {
//         draftPicks.push({
//           ...player,
//           drafted_team_id: pick.team_id,
//           drafted_team_name: draftedTeamName,
//           drafted_team_abbrev: draftedTeamAbbrev,
//           pick_number: pick.pick_number,
//         })
//       }
//     }

//     setDraftPicks(draftPicks.slice(0, 125))
//     setMyTeam(draftPicks.slice(0, 125).filter(pick => pick.drafted_team_id === teamId))
//   }

//   const fetchDraftOrder = async () => {
//     const response = await fetch(
//       `${BACKEND_URL}/league/getDraftOrder?leagueId=${league.id}&year=${year}`
//     )
//     const data = await response.json()

//     // Defensive: If data.draftOrder is an object (not array), convert to array
//     let orderArray: any[] = []
//     if (Array.isArray(data.draftOrder)) {
//       orderArray = data.draftOrder
//     } else if (typeof data.draftOrder === 'object' && data.draftOrder !== null) {
//       orderArray = Object.values(data.draftOrder)
//     }

//     const draftOrder: DraftPosition[] = []
//     for (const pick of orderArray) {
//       draftOrder.push({
//         id: pick.id,
//         team_id: pick.team_id,
//         pick_number: pick.pick_number,
//       })
//     }

//     setDraftOrder(draftOrder)
//   }

//   useEffect(() => {
//     fetchDraftPicks()
//     fetchDraftOrder()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [league, year])

//   return (
//     <div>
//       <h2>Year: {year}</h2>
//       <PlayerDetails
//         nflPlayers={nflPlayers}
//         nflTeams={nflTeams}
//         statsAndProjectedBreakdown={statsAndProjectedBreakdown}
//         myTeam={myTeam}
//       />

//       <ConfigureDraftOrder
//         league={league}
//         teamId={teamId}
//         year={year}
//         draftOrder={draftOrder}
//       />
//       {draftPicks && draftOrder && (
//         <DraftBoard
//           league={league}
//           draftPicks={draftPicks}
//           draftOrder={draftOrder}
//         />
//       )}
//       <BigBoard
//         teamId={teamId}
//         nflPlayers={nflPlayers}
//         nflTeams={nflTeams}
//         draftPicks={draftPicks}
//       />
//     </div>
//   )
// }
