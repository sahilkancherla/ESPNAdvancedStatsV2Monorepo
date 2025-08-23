/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export function DraftAnalysis({draftData, getPositionBadgeStyle, getRankDifferenceBadgeStyle, getFantasyPlayerTotalSeasonPoints}: {draftData: any, getPositionBadgeStyle: (position: string) => string, getRankDifferenceBadgeStyle: (rankDifference: number) => React.ReactElement | null | undefined, getFantasyPlayerTotalSeasonPoints: (playerId: string) => number | undefined}) {

    return (
        <Card>
        <CardHeader>
          <CardTitle>Draft Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20"></TableHead>
                <TableHead>Player</TableHead>
                <TableHead></TableHead>
                <TableHead>Total Season Points</TableHead>
                <TableHead>Current/Draft Position Rank </TableHead>
                <TableHead>Drafting Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draftData.map((pick: any) => (
                <TableRow key={pick.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">
                    <Badge variant="outline" className="ml-2">
                      Round {pick.round_number} Pick {pick.pick_number}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-large font-bold">{pick.player}</div>
                        <div className="text-sm text-muted-foreground">
                          {pick.nflTeamName}
                        </div>
                      </div>
                      <div>
                        <Badge 
                          variant="outline" 
                          className={getPositionBadgeStyle(pick.position)}
                        >
                          {pick.position}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getRankDifferenceBadgeStyle(pick.weightedRankDifference)}
                  </TableCell>
                  <TableCell className="text-center ">
                    {getFantasyPlayerTotalSeasonPoints(pick.player_id)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {pick.position}{pick.positionRank} / {pick.position}{pick.draftPositionRank}
                  </TableCell>
                  
                  <TableCell className="text-muted-foreground">
                    {pick.fantasyTeamName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };