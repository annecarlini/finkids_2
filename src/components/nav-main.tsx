import { ChevronRight, type LucideIcon, Lock } from "lucide-react"
import { useEffect, useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    requiresCoins?: number
    items?: {
      title: string
      url: string
      requiresCoins?: number
    }[]
  }[]
}) {
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/me/progress', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data?.success && data.progress?.phases) {
          let total = 0;
          Object.values(data.progress.phases).forEach((phase: any) => {
            if (phase.progress?.coins) {
              total += phase.progress.coins;
            }
          });
          setTotalCoins(total);
        }
      } catch (error) {
        console.error('Erro ao carregar moedas:', error);
      }
    };

    loadCoins();
    
    // Recarregar a cada 5 segundos
    const interval = setInterval(loadCoins, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isLocked = item.requiresCoins && totalCoins < item.requiresCoins;
          const coinsNeeded = item.requiresCoins ? item.requiresCoins - totalCoins : 0;
          
          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={isLocked ? "#" : item.url} style={{ opacity: isLocked ? 0.6 : 1 }}>
                    <item.icon />
                    <span>{item.title}</span>
                    {isLocked && (
                      <Lock className="ml-auto h-4 w-4" />
                    )}
                  </a>
                </SidebarMenuButton>
                {isLocked && item.requiresCoins && (
                  <div style={{ fontSize: '0.75rem', color: '#666', paddingLeft: '2.5rem', paddingTop: '0.25rem' }}>
                    Faltam {coinsNeeded} moedas
                  </div>
                )}
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const subIsLocked = subItem.requiresCoins && totalCoins < subItem.requiresCoins;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subIsLocked ? "#" : subItem.url} style={{ opacity: subIsLocked ? 0.6 : 1 }}>
                                  {subIsLocked && <Lock className="mr-2 h-3 w-3" />}
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
