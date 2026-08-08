import { Box, LinearProgress, Paper, Typography } from '@mui/material'
import { CalendarCheck, ListTodo, Users, UsersRound } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'

const STAT_CARDS = [
  { label: 'Students', value: 0, subtitle: '6 in Section B', icon: Users },
  { label: "Today's attendance", value: '0/0', subtitle: '0% present', icon: CalendarCheck },
  { label: 'Teams', value: 0, subtitle: 'Project groups', icon: UsersRound },
  { label: 'Tasks', value: 0, subtitle: '0 completed this week', icon: ListTodo },
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
          <StatCard key={card.label} {...card} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
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

        <Paper>
          <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(244, 249, 255, 1)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Attendance today
            </Typography>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Present rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={0}
                sx={{ flexGrow: 1, height: 6, borderRadius: 9999, bgcolor: 'rgba(241, 245, 249, 1)' }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                0%
              </Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Present
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  0
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Absent
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  0
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
