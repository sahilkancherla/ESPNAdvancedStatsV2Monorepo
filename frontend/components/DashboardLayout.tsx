"use client";

import { ReactNode } from 'react'
import { CustomSidebar } from "@/components/CustomSidebar"
import {
  SidebarInset,
} from "@/components/ui/sidebar"
import { Providers } from '@/components/Providers'
import { DashboardContent } from './DashboardContent';

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}


export function DashboardLayout({ 
  children, 
}: DashboardLayoutProps) {

  return (
      <Providers>
        <CustomSidebar />
        <SidebarInset>
          <DashboardContent>
            {children}
          </DashboardContent>
        </SidebarInset>
      </Providers>
  )
}