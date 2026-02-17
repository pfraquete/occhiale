import { formatPhone } from "@/shared/lib/utils/format";
import { User, Mail, Phone } from "lucide-react";

interface OrderCustomerInfoProps {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export function OrderCustomerInfo({ customer }: OrderCustomerInfoProps) {
  if (!customer) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-text-primary">Cliente</h3>
        <p className="mt-2 text-sm text-text-tertiary">
          Informação do cliente não disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary">Cliente</h3>
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <User className="h-4 w-4 text-text-tertiary" />
          {customer.name}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Mail className="h-4 w-4 text-text-tertiary" />
          {customer.email ?? "—"}
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Phone className="h-4 w-4 text-text-tertiary" />
            {formatPhone(customer.phone)}
          </div>
        )}
      </div>
    </div>
  );
}
