// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import DraftBoardNFLPlayer from "./DraftBoardNFLPlayer";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { DraftPick, DraftPosition, League } from "@/lib/interfaces";

// interface DraftBoardProps {
//   league: League;
//   draftPicks: DraftPick[];
//   draftOrder: DraftPosition[];
// }

// const maxNameLength = 12;

// function shortenName(firstName: string, lastName: string, maxLength: number) {
//   let fullName = `${firstName} ${lastName}`
//   if (fullName.length <= maxLength) return fullName

//   // First initial + last name
//   fullName = `${firstName[0]}. ${lastName}`
//   if (fullName.length <= maxLength) return fullName

//   // Truncate last name if still too long
//   const allowedLastNameLength = maxLength - (firstName[0].length + 3) // "X. " + "…"
//   const truncatedLastName =
//     lastName.length > allowedLastNameLength
//       ? lastName.slice(0, allowedLastNameLength) + '…'
//       : lastName

//   return `${firstName[0]}. ${truncatedLastName}`
// }

// function shortenText(text: string, maxLength: number) {
//   if (text.length <= maxLength) return text
//   return text.slice(0, maxLength) + '…'
// }

// function calculateRoundAndPick(pickNumber: number, teamCount: number) {
//     const round = Math.ceil(pickNumber / teamCount)
//     let pick = pickNumber % teamCount
//     if (pick === 0) pick = teamCount
//     return { round, pick }
// }

// export default function DraftBoard({ league, draftPicks, draftOrder }: DraftBoardProps) {
//   const [visibleTeams, setVisibleTeams] = useState<string[]>(
//     league.teams.map((t) => t.id)
//   );

//   // Take the last element of draftPicks and find the pick number. Slice until that point in draftOrder.
//   const lastDraftPick = draftPicks.length > 0 ? draftPicks[draftPicks.length - 1] : null;
//   const lastPickNumber = lastDraftPick ? lastDraftPick.pick_number : 0;
//   const remainingDraftOrder = lastPickNumber > 0
//     ? draftOrder.slice(lastPickNumber, draftOrder.length)
//     : [];

//   const toggleTeamVisibility = (teamId: string) => {
//     setVisibleTeams((prev) =>
//       prev.includes(teamId)
//         ? prev.filter((id) => id !== teamId)
//         : [...prev, teamId]
//     );
//   };

//   const [viewMode, setViewMode] = useState<"teamFormat" | "pickOrder">(
//     "teamFormat"
//   );

//   // Example of roster slots
//   const rosterFormat = ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX", "D/ST", "K"];

//   function sortTeamPicks(teamPicks: DraftPick[]) {
//     const starters: (DraftPick & { slot: string } | null)[] = [];
//     const bench: (DraftPick & { slot: string })[] = teamPicks.map(pick => ({ ...pick, slot: "" })); // copy to remove assigned starters

//     rosterFormat.forEach((slot) => {
//       let assignedIndex: number = -1;

//       if (slot === "FLEX") {
//         // FLEX can be RB/WR/TE
//         assignedIndex = bench.findIndex((pick) =>
//           ["RB", "WR", "TE"].includes(pick.position)
//         );
//       } else {
//         assignedIndex = bench.findIndex((pick) => pick.position === slot);
//       }

//       if (assignedIndex !== -1) {
//         const assigned = { ...bench[assignedIndex], slot };
//         starters.push(assigned);
//         bench.splice(assignedIndex, 1);
//       } else {
//         starters.push({ 
//           id: "", 
//           espn_player_id: 0, 
//           first_name: "EMPTY", 
//           last_name: "", 
//           position: "", 
//           team_id: "", 
//           team_name: "", 
//           team_abbrev: "", 
//           espn_team_id: 0, 
//           drafted_team_id: "", 
//           drafted_team_name: "", 
//           drafted_team_abbrev: "", 
//           pick_number: -1, 
//           slot 
//         }); // empty pick for slot
//       }
//     });

//     // Assign "BE" slot to all bench players
//     const benchWithSlot = bench.map(pick => ({ ...pick, slot: "BE" }));

//     return { starters, bench: benchWithSlot };
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-row justify-between items-center">
//         <CardTitle>Fantasy Football Draft Board</CardTitle>

//         <div className="flex gap-2 mb-4">
//           <Button
//             variant={viewMode === "teamFormat" ? "default" : "outline"}
//             onClick={() => setViewMode("teamFormat")}
//           >
//             By Team Format
//           </Button>
//           <Button
//             variant={viewMode === "pickOrder" ? "default" : "outline"}
//             onClick={() => setViewMode("pickOrder")}
//           >
//             By Pick Order
//           </Button>
//         </div>

//         {/* Team filter in a shadcn dropdown-menu */}
//         <div className="mt-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button className="border rounded px-3 py-1 bg-muted/50 hover:bg-muted transition">
//                 Filter Teams
//               </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent className="max-h-72 overflow-y-auto min-w-[220px]">
//               {league.teams.map((team) => (
//                 <DropdownMenuItem
//                   key={team.id}
//                   asChild
//                   onSelect={(e) => e.preventDefault()} // prevents menu from closing
//                 >
//                   <Label className="flex items-center gap-2 cursor-pointer w-full">
//                     <Checkbox
//                       checked={visibleTeams.includes(team.id)}
//                       onCheckedChange={() => toggleTeamVisibility(team.id)}
//                     />
//                     <span>{team.team_name}</span>
//                   </Label>
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </CardHeader>

//       <CardContent className="overflow-x-auto max-h-[600px] overflow-y-auto">
//         <div className="flex gap-6 overflow-x-auto pb-2">
//           {/* Main Draft Board */}
//           <div className="min-w-[260px] max-w-[320px] flex-shrink-0 space-y-2 mb-0 border rounded p-2 bg-muted/50 h-fit flex flex-col">
//             <h3 className="font-semibold text-lg mb-2 text-center">
//               Draft Picks (by order)
//             </h3>
//             <div
//               className="space-y-2 overflow-y-auto"
//               style={{ maxHeight: 500 }}
//             >
//               {[...draftPicks]
//                 .slice()
//                 .map((pick) => (
//                   <DraftBoardNFLPlayer
//                     key={pick.id}
//                     title={shortenName(pick.first_name, pick.last_name, maxNameLength)}
//                     badgeText={`Round ${calculateRoundAndPick(pick.pick_number, league.teams.length).round} Pick ${calculateRoundAndPick(pick.pick_number, league.teams.length).pick}`}
//                     subtitleOne={pick.position}
//                     subtitleTwo={pick.drafted_team_name}
//                     leftValue={`${pick.pick_number}`}
//                   />
                  
//                 ))}

//               {draftPicks.length > 0 && remainingDraftOrder.length > 0 && (
//                 <div className="border-t my-2 pt-2 text-center text-xs text-muted-foreground">
//                   Remaining Picks
//                 </div>
//               )}
                

//               {remainingDraftOrder.map((position) => (
//                 <div key={position.id}>
//                   <DraftBoardNFLPlayer
//                     key={position.id}
//                     title={shortenText(league.teams.find(team => team.id === position.team_id)?.team_name || `Team ${position.team_id}`, maxNameLength + 4)}
//                     badgeText={""}
//                     subtitleOne={`Round ${calculateRoundAndPick(position.pick_number, league.teams.length).round} Pick ${calculateRoundAndPick(position.pick_number, league.teams.length).pick}`}
//                     subtitleTwo={""}
//                     leftValue={`${position.pick_number}`}
//                   />
                  
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Per-Team Draft Columns */}
//           {viewMode === "pickOrder" && (
//             <div className="flex gap-4 overflow-x-auto">
//               {league.teams
//                 .filter((team) => visibleTeams.includes(team.id))
//                 .map((team) => {
//                   const teamPicks = draftPicks
//                     .filter((pick) => pick.drafted_team_id === team.id)
//                     .sort((a, b) => a.pick_number - b.pick_number);

//                   return (
//                     <div
//                       key={team.id}
//                       className="min-w-[220px] border rounded p-2 bg-muted/50 flex-shrink-0 flex flex-col"
//                     >
//                       <div className="font-semibold text-center mb-2">
//                         {team.team_name || `Team ${team.id}`}
//                       </div>
//                       <div
//                         className="space-y-2 overflow-y-auto"
//                         style={{ maxHeight: 500 }}
//                       >
//                         {teamPicks.length === 0 ? (
//                           <div className="text-xs text-muted-foreground text-center">
//                             No picks
//                           </div>
//                         ) : (
//                           teamPicks.map((pick) => (
//                             <DraftBoardNFLPlayer
//                               key={pick.id}
//                               title={shortenName(pick.first_name, pick.last_name, maxNameLength)}
//                               badgeText={`Round ${calculateRoundAndPick(pick.pick_number, league.teams.length).round} Pick ${calculateRoundAndPick(pick.pick_number, league.teams.length).pick}`}
//                               subtitleOne={pick.position}
//                               subtitleTwo={pick.drafted_team_name}
//                               leftValue={`${pick.pick_number}`}
//                             />
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}

//           {viewMode === "teamFormat" && (
//             <div className="flex gap-4 overflow-x-auto">
//               {league.teams
//                 .filter((team) => visibleTeams.includes(team.id))
//                 .map((team) => {
//                   const teamPicks = draftPicks
//                     .filter((pick) => pick.drafted_team_id === team.id)
//                     .sort((a, b) => a.pick_number - b.pick_number);

//                   const { starters, bench } = sortTeamPicks(teamPicks);

//                   return (
//                     <div
//                       key={team.id}
//                       className="min-w-[220px] border rounded p-2 bg-muted/50 flex-shrink-0 flex flex-col"
//                     >
//                       <div className="font-semibold text-center mb-2">
//                         {team.team_name || `Team ${team.id}`}
//                       </div>

//                       <div
//                         className="space-y-2 overflow-y-auto"
//                         style={{ maxHeight: 500 }}
//                       >
//                         {/* Render starters */}
//                         {starters.map((pick, idx) => {
//                           if (pick && pick.pick_number === -1) {
//                             return (
//                               <div
//                                 key={`empty-${idx}`}
//                                 className="p-2 border rounded bg-gray-100 text-center text-xs text-muted-foreground"
//                               >
//                                 No {pick.slot} drafted yet
//                               </div>
//                             );
//                           } else if (pick) {
//                             return (
//                               <DraftBoardNFLPlayer
//                                 key={pick.id}
//                                 title={shortenName(pick.first_name, pick.last_name, maxNameLength)}
//                                 badgeText={`Round ${calculateRoundAndPick(pick.pick_number, league.teams.length).round} Pick ${calculateRoundAndPick(pick.pick_number, league.teams.length).pick}`}
//                                 subtitleOne={pick.position}
//                                 subtitleTwo={pick.drafted_team_name}
//                                 leftValue={`${pick.slot}`}
//                               />
//                             );
//                           } else {
//                             return (
//                               <div
//                                 key={`empty-${idx}`}
//                                 className="p-2 border rounded bg-gray-100 text-center text-xs text-muted-foreground"
//                               >
//                                 Not drafted a {pick?.slot}
//                               </div>
//                             );
//                           }
//                         })}

//                         {/* Separator */}
//                         {bench.length > 0 && (
//                           <div className="border-t my-2 pt-2 text-center text-xs text-muted-foreground">
//                             Bench
//                           </div>
//                         )}

//                         {/* Render bench */}
//                         {bench.map((pick) => (
//                           <DraftBoardNFLPlayer
//                             key={pick.id}
//                             title={shortenName(pick.first_name, pick.last_name, maxNameLength)}
//                             badgeText={`Round ${calculateRoundAndPick(pick.pick_number, league.teams.length).round} Pick ${calculateRoundAndPick(pick.pick_number, league.teams.length).pick}`}
//                             subtitleOne={pick.position}
//                             subtitleTwo={pick.drafted_team_name}
//                             leftValue={`${pick.slot}`}
//                           />
//                         ))}

//                         {teamPicks.length === 0 && (
//                           <div className="text-xs text-muted-foreground text-center">
//                             No picks
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
