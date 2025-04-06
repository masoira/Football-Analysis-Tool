import React from "react";
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const StatsTable = ({ data }) => {
  const columns = [
    { accessorKey: 'Statistic', header: 'Statistic' },
    { accessorKey: 'Your Team', header: 'Your Team' },
    { accessorKey: 'Opponent', header: 'Opponent' },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.accessorKey}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatsTable;
