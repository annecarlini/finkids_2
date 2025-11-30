"use client"

import * as React from "react"
import {
  // BookOpen,
  // Bot,
  Command,
  // Frame,
  LifeBuoy,
  // Map,
  // PieChart,
  Send,
  // Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
// Hook de autenticação local que sincroniza com localStorage
// Usado aqui para mostrar avatar/nome do usuário logado no sidebar
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Nome do Usuário",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Conceitos de aprendizagem",
      url: "/phase",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Fase 1",
          url: "/phase",
        },
        {
          title: "Fase 2",
          url: "/phase",
        },
        {
          title: "Fase 3",
          url: "/phase",
        },
      ],
    },
    {
      title: "Jogos de aprendizagem",
      url: "/game1",
      icon: SquareTerminal,
      isActive: true,
      requiresCoins: 200,
      items: [
        {
          title: "Labirinto",
          url: "/game1",
          requiresCoins: 200,
        },
        {
          title: "Carrinho",
          url: "/game2",
          requiresCoins: 200,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    
    
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Obter usuário do hook. Se não houver usuário, usamos um dado de
  // fallback (data.user) para manter o sidebar preenchido durante
  // desenvolvimento / antes do login.
  const { user } = useAuth()
  const currentUser = user || data.user
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* Passa o usuário para o componente NavUser. Comentário: NavUser
          espera um objeto com name, email e avatar (url relativa).
          Usamos `currentUser.avatar` que normalmente vem do campo
          `public_url` do backend (ex: /avatars/avatar1.png). */}
        <NavUser user={{ name: currentUser.name || currentUser.name || 'Usuário', email: currentUser.email || 'user@example.com', avatar: currentUser.avatar || '/avatars/shadcn.jpg' }} />
      </SidebarFooter>
    </Sidebar>
  )
}
