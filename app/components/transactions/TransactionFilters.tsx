'use client';

import { TransactionFilters as TransactionFiltersType } from '@/types/api';
import { CATEGORIES } from '@/types/transaction';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface TransactionFiltersProps {
  filters: TransactionFiltersType;
  onChange: (filters: TransactionFiltersType) => void;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  const dateError =
    filters.start_date && filters.end_date && filters.start_date > filters.end_date
      ? 'Data inicial deve ser anterior à data final'
      : undefined;

  const handleClear = () => onChange({});

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border/60 bg-bg-card p-4">
      <Input
        label="Data inicial"
        type="date"
        value={filters.start_date ?? ''}
        error={dateError}
        onChange={(e) => onChange({ ...filters, start_date: e.target.value || undefined })}
      />
      <Input
        label="Data final"
        type="date"
        value={filters.end_date ?? ''}
        onChange={(e) => onChange({ ...filters, end_date: e.target.value || undefined })}
      />
      <Select
        label="Tipo"
        value={filters.type ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            type: (e.target.value || undefined) as TransactionFiltersType['type'],
          })
        }
      >
        <option value="">Todos</option>
        <option value="receita">Receita</option>
        <option value="despesa">Despesa</option>
      </Select>
      <Select
        label="Categoria"
        value={filters.category ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            category: (e.target.value || undefined) as TransactionFiltersType['category'],
          })
        }
      >
        <option value="">Todas</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Input
        label="Buscar na descrição"
        type="text"
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
      />

      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
            {activeCount} filtro{activeCount > 1 ? 's' : ''}
          </span>
        )}
        <Button type="button" variant="secondary" onClick={handleClear}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
