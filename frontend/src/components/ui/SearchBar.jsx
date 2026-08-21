import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from './Input'

export const SearchBar = ({ value = '', onChange, onKeyDown, placeholder = 'Search...', delay = 300, className }) => {
  const [localValue, setLocalValue] = useState(value || '')
  const onChangeRef = useRef(onChange)
  const isMounted = useRef(false)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    if (localValue === (value || '')) {
      return
    }

    const handler = setTimeout(() => {
      if (onChangeRef.current) {
        onChangeRef.current(localValue)
      }
    }, delay)

    return () => clearTimeout(handler)
  }, [localValue, delay, value])

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
