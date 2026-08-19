import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from './Input'

export const SearchBar = ({ value, onChange, onKeyDown, placeholder = 'Search...', delay = 300, className }) => {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) onChange(localValue)
    }, delay)

    return () => clearTimeout(handler)
  }, [localValue, onChange, delay])

  return (
    <div className={cn('relative w-full min-w-0 sm:max-w-xs', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-11 rounded-lg bg-card pl-10"
      />
    </div>
  )
}
