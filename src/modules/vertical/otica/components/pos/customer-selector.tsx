"use client";

import { useState, useTransition } from "react";
import { User, Search, UserPlus } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
}

interface CustomerSelectorProps {
    onSelect: (customer: Customer | null) => void;
    selectedCustomer: Customer | null;
    customers: Customer[];
}

export function CustomerSelector({ onSelect, selectedCustomer, customers }: CustomerSelectorProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Customer[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleSearch = (q: string) => {
        setQuery(q);
        if (q.length > 2) {
            const filtered = customers.filter(c =>
                c.name.toLowerCase().includes(q.toLowerCase()) ||
                c.cpf?.includes(q) ||
                c.email?.toLowerCase().includes(q.toLowerCase())
            );
            setResults(filtered.slice(0, 5));
            setIsOpen(true);
        } else {
            setResults([]);
        }
    };

    if (selectedCustomer) {
        return (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-brand-100 p-2 text-brand-600">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">{selectedCustomer.name}</p>
                        <p className="text-xs text-text-tertiary">
                            {selectedCustomer.cpf ? `CPF: ${selectedCustomer.cpf}` : selectedCustomer.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onSelect(null)}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                    Trocar
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                    type="text"
                    placeholder="Buscar cliente (Nome, CPF...)"
                    className="w-full rounded-xl border border-border bg-bg-secondary py-3 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface shadow-xl">
                    <ul className="py-2">
                        {results.map((c) => (
                            <li key={c.id}>
                                <button
                                    onClick={() => {
                                        onSelect(c);
                                        setIsOpen(false);
                                        setQuery("");
                                    }}
                                    className="flex w-full flex-col px-4 py-2 hover:bg-bg-secondary text-left"
                                >
                                    <span className="text-sm font-medium text-text-primary">{c.name}</span>
                                    <span className="text-xs text-text-tertiary">{c.cpf || c.email}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!selectedCustomer && query.length > 0 && results.length === 0 && (
                <div className="mt-2 text-center text-xs text-text-tertiary">
                    Nenhum cliente encontrado.
                </div>
            )}
        </div>
    );
}
