import { ReactNode } from 'react';
import { useTranslation } from '@/utils/translation';

export interface Column<T> {
    label: string;
    key?: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    emptyMessage,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const resolvedEmptyMessage = emptyMessage ?? t('no_data_found');
    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${col.className || ''}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    {resolvedEmptyMessage}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((item, rowIndex) => (
                            <tr
                                key={item.id ?? rowIndex}
                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${col.className || ''}`}
                                    >
                                        {col.render
                                            ? col.render(item)
                                            : col.key
                                            ? item[col.key]
                                            : null}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
