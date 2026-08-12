import React from 'react';
import {
  useTable,
  createCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import { EmptyState, LoadingState } from './StateComponents';

export const DataTable = ({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found",
}) => {
  const table = useTable({
    data: data || [],
    columns,
    getCoreRowModel: createCoreRowModel(),
  });

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  if (!data || data.length === 0) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <EmptyState message={emptyMessage} />
      </Paper>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      elevation={0} 
      sx={{ 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: '12px',
        maxWidth: '100%',
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Table sx={{ minWidth: { xs: 500, md: 650 } }} aria-label="data table">
        <TableHead sx={{ backgroundColor: 'grey.50' }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell 
                  key={header.id}
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.secondary',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
            >
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
