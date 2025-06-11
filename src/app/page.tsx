'use client'
import { Shell } from '@/components/Shell'
import * as Layout from '@/components/Layout'
import { Timeline } from '@/components/Timeline'

export default function HomePage() {
  const handlePostClick = (post: any) => {
    console.log('Post clicked:', post)
    // You can add navigation logic here later
  }

  return (
    <Shell>
      <Layout.Screen>
        <Layout.Header.Outer>
          <Layout.Header.MenuButton />
          <Layout.Header.Content>
            <Layout.Header.TitleText>Home</Layout.Header.TitleText>
          </Layout.Header.Content>
          <Layout.Header.Slot>
            {/* Theme selector or other controls */}
          </Layout.Header.Slot>
        </Layout.Header.Outer>
        
        <Layout.Content>
          <Timeline 
            feedType="timeline" 
            onPostClick={handlePostClick}
          />
        </Layout.Content>
      </Layout.Screen>
    </Shell>
  )
}
