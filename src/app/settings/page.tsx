'use client'
import { Shell } from '@/components/Shell'
import * as Layout from '@/components/Layout'
import { ThemeSelector } from '@/components/ThemeSelector'
import { SessionDebug } from '@/components/SessionDebug'
import { QuickLogin } from '@/components/QuickLogin'

export default function SettingsPage() {
  return (
    <Shell>
      <Layout.Screen>
        <Layout.Header.Outer>
          <Layout.Header.BackButton />
          <Layout.Header.Content>
            <Layout.Header.TitleText>Settings</Layout.Header.TitleText>
          </Layout.Header.Content>
          <Layout.Header.Slot />
        </Layout.Header.Outer>
        
        <Layout.Content className="p-6 space-y-6">
          <ThemeSelector />
          <QuickLogin />
          <SessionDebug />
        </Layout.Content>
      </Layout.Screen>
    </Shell>
  )
}
