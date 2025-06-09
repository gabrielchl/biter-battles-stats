import { createFileRoute } from '@tanstack/react-router'
import { CaptainsPlayers } from './-components/captains-players'
import { CaptainsCaptains } from './-components/captains-captains'
import { CaptainsCaptainsWithPlayers } from './-components/captains-captains-with-players'
import { CaptainsDates } from './-components/captains-dates'

export const Route = createFileRoute('/captains-games/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div style={{marginBottom: '50px'}}>
      player stats:
      <CaptainsPlayers />

      captain stats:
      <CaptainsCaptains />

      captain + player combination stats:
      <CaptainsCaptainsWithPlayers />

      dates:
      <CaptainsDates />
    </div>
  )
}
