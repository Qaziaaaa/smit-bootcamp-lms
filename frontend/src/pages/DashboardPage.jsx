import { Box, Paper, Typography } from '@mui/material'
import { CalendarCheck, ListTodo, Users, UsersRound } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'

const STAT_CARDS = [
  { label: 'Students', value: 0, icon: Users },
  { label: "Today's Attendance", value: 0, icon: CalendarCheck },
  { label: 'Teams', value: 0, icon: UsersRound },
  { label: 'Tasks', value: 0, icon: ListTodo },
]

export default function DashboardPage() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </Box>

      <Paper>
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(244, 249, 255, 1)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Recent Activity
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
          Activity will appear here as records are created.
        </Typography>
      </Paper>
    </Box>
  )
}
