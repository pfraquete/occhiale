import { cn } from "@/shared/lib/utils/cn";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Confirmado",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  processing: {
    label: "Processando",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  shipped: {
    label: "Enviado",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  delivered: {
    label: "Entregue",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const paymentStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Aguardando",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  paid: {
    label: "Pago",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  refunded: {
    label: "Reembolsado",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
};

interface OrderStatusBadgeProps {
  status: string;
  type?: "order" | "payment";
}

export function OrderStatusBadge({
  status,
  type = "order",
}: OrderStatusBadgeProps) {
  const config = type === "payment" ? paymentStatusConfig : statusConfig;
  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}
