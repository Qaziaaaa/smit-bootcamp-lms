import { Select } from './Select'

export const FilterBar = ({ label, value, onChange, options = [], disabled }) => (
  <div className="w-full min-w-0 sm:w-auto sm:min-w-[160px] sm:flex-1">
    <Select
      label={label}
      value={value || ''}
      onChange={(next) => onChange && onChange(next)}
      options={options}
      placeholder="All"
      disabled={disabled}
    />
  </div>
)
