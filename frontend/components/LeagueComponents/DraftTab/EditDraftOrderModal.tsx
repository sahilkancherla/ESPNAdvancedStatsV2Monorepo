'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DndContext } from "@dnd-kit/core"
import { useState } from "react"
import { SortableItem } from "./SortableItem"
import { DraftPosition } from "@/lib/interfaces"

interface EditDraftOrderModalProps {
  league: League
  open: boolean
  onClose: () => void
  year: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function EditDraftOrderModal({ league, open, onClose, year }: EditDraftOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [teamOrder, setTeamOrder] = useState<string[]>(league.teams.map(t => t.id))
  const [rounds, setRounds] = useState(15)
  const [snake, setSnake] = useState(true)
  const [picks, setPicks] = useState<DraftPosition[]>([])

  const generateDraftOrder = () => {
    const generated: DraftPosition[] = []
    let pickCounter = 1

    for (let round = 1; round <= rounds; round++) {
      const roundTeams = snake && round % 2 === 0
        ? [...teamOrder].reverse()
        : [...teamOrder]

      roundTeams.forEach((teamId) => {
        generated.push({
          id: `${year}-${round}-${teamId}`, // unique pick id
          team_id: teamId,
          pick_number: pickCounter++
        })
      })
    }

    setPicks(generated)
    setStep(2)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = picks.findIndex(p => p.id === active.id)
    const newIndex = picks.findIndex(p => p.id === over.id)
    const updated = [...picks]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)

    // Reassign pick numbers after reordering
    const reordered = updated.map((p, idx) => ({
      ...p,
      pick_number: idx + 1
    }))

    setPicks(reordered)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/league/configureDraftOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: league.id,
          year,
          draftOrder: picks.map(({ team_id, pick_number }) => ({
            teamId: team_id,
            pickNumber: pick_number
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save draft order:', errorData)
        return
      }

      onClose()
    } catch (err) {
      console.error('Network error saving draft order:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Configure Draft Settings" : "Adjust Individual Picks"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="overflow-y-auto pr-2">
            <h4 className="mb-2 font-semibold">Team Order</h4>
            <DndContext onDragEnd={(e) => {
              const { active, over } = e
              if (!over || active.id === over.id) return
              const oldIndex = teamOrder.indexOf(active.id)
              const newIndex = teamOrder.indexOf(over.id)
              const updated = [...teamOrder]
              updated.splice(oldIndex, 1)
              updated.splice(newIndex, 0, active.id)
              setTeamOrder(updated)
            }}>
              <SortableContext items={teamOrder} strategy={verticalListSortingStrategy}>
                {teamOrder.map(teamId => (
                  <SortableItem
                    key={teamId}
                    id={teamId}
                    content={league.teams.find(t => t.id === teamId)?.team_name || ""}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <div className="mt-4">
              <label>Rounds</label>
              <input
                type="number"
                className="border p-1 ml-2"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
              />
            </div>

            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                checked={snake}
                onChange={(e) => setSnake(e.target.checked)}
              />
              <label className="ml-2">Snake Draft</label>
            </div>

            <Button className="mt-4 w-full" onClick={generateDraftOrder}>
              Generate Draft Order
            </Button>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="flex justify-between mb-4">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <h4 className="mb-2 font-semibold">Drag to Reorder Picks</h4>
              <DndContext onDragEnd={handleDragEnd}>
                <SortableContext items={picks.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {picks.map(pick => (
                    <SortableItem
                      key={pick.id}
                      id={pick.id}
                      content={`Pick ${pick.pick_number} - ${league.teams.find(t => t.id === pick.team_id)?.team_name || ""}`}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <Button className="mt-4 w-full" onClick={handleSave}>
              Save Draft Order
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
