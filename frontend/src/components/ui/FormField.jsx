import { cn } from '../../lib/utils'
import { Input } from './Input'
import { Label } from './Label'

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder,
  multiline,
  rows = 4,
  disabled,
  className,
  ...props
}) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
    )}
    {multiline ? (
      <textarea
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
        )}
        {...props}
      />
    ) : (
      <Input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        {...props}
      />
    )}
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
)
