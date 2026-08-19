import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export function StudentSearchSelect({
  label,
  value,
  onChange,
  students = [],
  placeholder = 'Search student by name or roll no...',
  error,
  disabled = false,
  required = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find currently selected student object
  const selectedStudent = useMemo(() => {
    if (!value) return null;
    return students.find((s) => (s._id || s.id) === value) || null;
  }, [students, value]);

  // Sync query when selected student changes and not actively searching
  useEffect(() => {
    if (!isFocused) {
      if (selectedStudent) {
        setQuery(selectedStudent.name || '');
      } else {
        setQuery('');
      }
    }
  }, [selectedStudent, isFocused]);

  // Filter students by name and rollNo (and email/batch)
  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || (!isFocused && selectedStudent)) return students;

    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const rollNo = (s.rollNo || s.rollNumber || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const batch = (s.batch || '').toLowerCase();

      return (
        name.includes(q) ||
        rollNo.includes(q) ||
        email.includes(q) ||
        batch.includes(q)
      );
    });
  }, [students, query, isFocused, selectedStudent]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
        if (selectedStudent) {
          setQuery(selectedStudent.name || '');
        } else {
          setQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedStudent]);

  const handleSelect = (studentId) => {
    onChange?.(studentId);
    setIsOpen(false);
    setIsFocused(false);
    const chosen = students.find((s) => (s._id || s.id) === studentId);
    setQuery(chosen ? chosen.name : '');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    setIsOpen(true);
    // If student is selected, clear query so full list is accessible or allow editing query
    if (selectedStudent && query === selectedStudent.name) {
      inputRef.current?.select();
    }
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <Label className="mb-1.5 block">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      {/* Main Search Input Field */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            'h-9 w-full rounded-md border border-input bg-background pl-9 pr-16 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:ring-destructive',
            isOpen && 'ring-2 ring-ring border-ring',
          )}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
        />

        {/* Selected Roll Number Badge (shown inside the input when not actively typing/focused) */}
        {!isOpen && selectedStudent && (selectedStudent.rollNo || selectedStudent.rollNumber) && (
          <div className="pointer-events-none absolute right-10 flex items-center">
            <span className="rounded bg-clr-blue-bg px-1.5 py-0.5 text-[10px] font-mono font-medium text-clr-blue">
              {selectedStudent.rollNo || selectedStudent.rollNumber}
            </span>
          </div>
        )}

        {/* Action icons on right */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {(value || query) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selection"
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                if (isOpen) {
                  setIsOpen(false);
                } else {
                  inputRef.current?.focus();
                  setIsOpen(true);
                }
              }
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="max-h-56 overflow-y-auto p-1 text-sm">
            {/* Unassigned / None Option */}
            <div
              onClick={() => handleSelect('')}
              className={cn(
                'flex items-center justify-between rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors',
                !value && 'bg-accent/60 font-medium text-foreground',
              )}
            >
              <span className="italic">Unassigned (None)</span>
              {!value && <Check className="h-3.5 w-3.5 text-clr-green" />}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No students found matching &quot;{query}&quot;
              </div>
            ) : (
              filteredStudents.map((student) => {
                const sId = student._id || student.id;
                const isSelected = value === sId;
                const rollNo = student.rollNo || student.rollNumber;

                return (
                  <div
                    key={sId}
                    onClick={() => handleSelect(sId)}
                    className={cn(
                      'flex items-center justify-between rounded px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors gap-2',
                      isSelected && 'bg-accent font-medium text-foreground',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-foreground">{student.name}</span>
                        {rollNo && (
                          <span className="rounded bg-muted px-1.5 py-0.25 text-[10px] font-mono text-muted-foreground border border-border">
                            {rollNo}
                          </span>
                        )}
                      </div>
                      {student.email && (
                        <p className="text-[11px] text-muted-foreground truncate">{student.email}</p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-clr-green shrink-0 ml-1" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          <div className="px-2.5 py-1.5 border-t border-border bg-muted/20 text-[10px] text-muted-foreground flex justify-between items-center">
            <span>
              {filteredStudents.length} of {students.length} student{students.length === 1 ? '' : 's'}
            </span>
            {query && (
              <span className="text-[10px] text-muted-foreground">
                Filtered by: &quot;{query}&quot;
              </span>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
