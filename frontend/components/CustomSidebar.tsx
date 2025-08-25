import {
  ChevronRight,
  Trophy,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Search,
  MessageCircle,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useLeagueTeamData } from "@/context/LeagueTeamDataContext"

const data = {
  myLeague: [
    {
      title: "League Median",
      url: "/league-median",
      icon: TrendingUp,
    },
    {
      title: "Points Missed",
      url: "/points-missed",
      icon: Target,
    },
    {
      title: "Draft",
      url: "/draft",
      icon: Users,
    },
    {
      title: "Player Tiers",
      url: "/player-tiers",
      icon: BarChart3,
    },
    {
      title: "Luck",
      url: "/luck",
      icon: Trophy,
    },
      // {
      //   title: "Trade Evaluators",
      //   url: "/trade-evaluators",
      //   icon: ArrowRightLeft,
    // },
  ],
  research: [
    {
      title: "AI Assistant",
      url: "/chatbot",
      icon: MessageCircle,
    },
    // {
    //   title: "Volume",
    //   url: "/volume",
    //   icon: BarChart3,
    // },
    // {
    //   title: "Player Rankings",
    //   url: "/player-rankings",
    //   icon: Trophy,
    // },
  ],
}

export function CustomSidebar() {
  const { leagues, isLoading } = useLeagueTeamData();
  
  const hasLeagues = leagues && leagues.length > 0;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ESPN FF Advanced Stats</SidebarGroupLabel>
          <SidebarMenu>
            {isLoading ? null : !hasLeagues ? (
              <SidebarMenuItem>
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  <p className="text-xs">Join or register a league to view features</p>
                </div>
              </SidebarMenuItem>
            ) : (
              <>
                <Collapsible asChild defaultOpen={true}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group/collapsible">
                        <Trophy />
                        <span>My League</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {data.myLeague.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild defaultOpen={false}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group/collapsible">
                        <Search />
                        <span>Research</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {data.research.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}