import { Badge } from "@/components/ui/badge";
import { ServiceOrderStatus } from "@/lib/supabase/queries/service-orders";

interface OSStatusBadgeProps {
    status: ServiceOrderStatus | string;
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" | "cta" }> = {
    lab_pending: { label: "Laboratório Pendente", variant: "warning" },
    waiting_material: { label: "Aguardando Material", variant: "warning" },
    surfacing: { label: "Surfaçagem", variant: "default" },
    mounting: { label: "Montagem", variant: "default" },
    quality_control: { label: "Conferência", variant: "cta" },
    ready_for_pickup: { label: "Pronto para Retirada", variant: "success" },
    delivered: { label: "Entregue", variant: "outline" },
    cancelled: { label: "Cancelado", variant: "danger" },
};

export function OSStatusBadge({ status }: OSStatusBadgeProps) {
    const config = statusMap[status] || { label: status, variant: "outline" };

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}
