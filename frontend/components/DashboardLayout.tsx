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

const year = 2024;

export function DashboardLayout({ 
  children, 
}: DashboardLayoutProps) {

  return (
      <Providers year={year}>
        <CustomSidebar />
        <SidebarInset>
          <DashboardContent>
            {children}
          </DashboardContent>
        </SidebarInset>
      </Providers>
  )
}