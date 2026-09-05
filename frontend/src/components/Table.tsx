import React, { useState, useMemo } from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  hoverable?: boolean;
  striped?: boolean;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is currently no data to display.',
  emptyAction,
  onRowClick,
  hoverable = true,
  striped = false,
  className = '',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    if (sortKey === column.key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(column.key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    const column = columns.find((c) => c.key === sortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (typeof column.accessor === 'function') {
        valA = column.accessor(a, 0);
        valB = column.accessor(b, 0);
      } else if (column.accessor) {
        valA = a[column.accessor];
        valB = b[column.accessor];
      } else {
        valA = (a as any)[column.key];
        valB = (b as any)[column.key];
      }

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const comparison = valA < valB ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600 border-collapse">
          <thead className="bg-neutral-50/80 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-200/70 select-none tracking-wider">
            <tr>
              {columns.map((column) => {
                const isSorted = sortKey === column.key;
                const alignClass = alignClasses[column.align || 'left'];

                return (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`
                      px-6 py-3.5 ${alignClass} ${column.className || ''}
                      ${column.sortable ? 'cursor-pointer hover:text-neutral-900 hover:bg-neutral-100/60 transition-colors' : ''}
                    `}
                    onClick={() => handleSort(column)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="inline-flex flex-col text-[9px] text-neutral-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            )
                          ) : (
                            <svg className="w-3.5 h-3.5 text-neutral-300 hover:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner size="lg" color="primary" />
                    <span className="text-xs font-medium text-neutral-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const rowKey = keyExtractor(item, index);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`
                      transition-colors duration-100
                      ${striped && index % 2 === 1 ? 'bg-neutral-50/40' : 'bg-white'}
                      ${hoverable ? 'hover:bg-neutral-50/90' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                  >
                    {columns.map((column) => {
                      const alignClass = alignClasses[column.align || 'left'];
                      let cellValue: React.ReactNode;

                      if (typeof column.accessor === 'function') {
                        cellValue = column.accessor(item, index);
                      } else if (column.accessor) {
                        cellValue = item[column.accessor] as unknown as React.ReactNode;
                      } else {
                        cellValue = (item as any)[column.key];
                      }

                      return (
                        <td
                          key={`${String(rowKey)}-${column.key}`}
                          className={`px-6 py-4 text-sm text-neutral-700 whitespace-nowrap ${alignClass} ${column.className || ''}`}
                        >
                          {cellValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
