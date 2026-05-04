'use client'

import { motion } from 'framer-motion'

interface StatsBarProps {
  countryCount: number
  friendCount: number
  photoCount: number
}

export default function StatsBar({ countryCount, friendCount, photoCount }: StatsBarProps) {
  const stats = [
    { value: countryCount, label: 'countries' },
    { value: friendCount, label: 'friends made' },
    { value: photoCount, label: 'memories' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '2rem',
      justifyContent: 'center',
      padding: '1rem 0',
    }}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 400,
            color: 'var(--glow)',
            lineHeight: 1,
          }}>
            {s.value}
          </div>
          <div style={{
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
          }}>
            {s.label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
