"use client";

import { OSStatusBadge } from "./os-status-badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Eye } from "lucide-react";

interface OSTableProps {
    serviceOrders: any[];
}

export function OSTable({ serviceOrders }: OSTableProps) {
    if (serviceOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-12 text-center">
                <p className="text-sm text-text-tertiary">
                    Nenhuma ordem de serviço encontrada.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-surface">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                            <th className="px-5 py-3">Pedido</th>
                            <th className="px-5 py-3">Cliente</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Laboratório</th>
                            <th className="px-5 py-3">Previsão</th>
                            <th className="px-5 py-3">Criado em</th>
                            <th className="px-5 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {serviceOrders.map((os) => (
                            <tr key={os.id} className="hover:bg-bg-secondary/50">
                                <td className="px-5 py-3">
                                    <Link
                                        href={`/dashboard/pedidos/${os.order_id}`}
                                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                                    >
                                        #{os.order?.order_number}
                                    </Link>
                                </td>
                                <td className="px-5 py-3">
                                    <p className="text-sm text-text-primary">
                                        {os.customer?.name}
                                    </p>
                                </td>
                                <td className="px-5 py-3">
                                    <OSStatusBadge status={os.status} />
                                </td>
                                <td className="px-5 py-3 text-sm text-text-secondary">
                                    {os.lab_name || "—"}
                                </td>
                                <td className="px-5 py-3 text-sm text-text-tertiary">
                                    {os.expected_at
                                        ? format(new Date(os.expected_at), "dd/MM/yyyy", { locale: ptBR })
                                        : "—"}
                                </td>
                                <td className="px-5 py-3 text-sm text-text-tertiary">
                                    {format(new Date(os.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link
                                        href={`/dashboard/ordens-servico/${os.id}`}
                                        className="inline-flex items-center justify-center rounded-md p-2 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
