import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { getServiceOrderById } from "@/lib/supabase/queries/service-orders";
import { redirect, notFound } from "next/navigation";
import { OSStatusBadge } from "@/components/dashboard/os-status-badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Beaker, User, Clipboard, Calendar } from "lucide-react";
import { UpdateOSStatusForm } from "@/components/dashboard/update-os-status-form";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ServiceOrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await getUserStoreWithRole(user.id);
    if (!membership) redirect("/login");

    const os = await getServiceOrderById(id);
    if (!os || os.store_id !== membership.storeId) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/ordens-servico"
                    className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">
                        OS de Lab #{os.order?.order_number}
                    </h1>
                    <p className="text-sm text-text-tertiary">
                        Criada em {format(new Date(os.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="ml-auto">
                    <OSStatusBadge status={os.status} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Column */}
                <div className="space-y-6 md:col-span-2">
                    {/* Status Update Card */}
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <h3 className="mb-4 flex items-center text-sm font-semibold text-text-primary">
                            <Beaker className="mr-2 h-4 w-4 text-brand-500" />
                            Atualizar Status de Laboratório
                        </h3>
                        <UpdateOSStatusForm osId={os.id} currentStatus={os.status} />
                    </div>

                    {/* Technical Info */}
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <h3 className="mb-4 flex items-center text-sm font-semibold text-text-primary">
                            <Clipboard className="mr-2 h-4 w-4 text-brand-500" />
                            Dados Técnicos
                        </h3>

                        {os.prescription ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg bg-bg-secondary p-4">
                                    <p className="text-xs font-medium text-text-tertiary uppercase letter-spacing-wider">Olho Direito (OD)</p>
                                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                                        <div><span className="text-text-tertiary">Esf:</span> {os.prescription.od_sphere || "0.00"}</div>
                                        <div><span className="text-text-tertiary">Cil:</span> {os.prescription.od_cylinder || "0.00"}</div>
                                        <div><span className="text-text-tertiary">Eixo:</span> {os.prescription.od_axis || "0"}°</div>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-bg-secondary p-4">
                                    <p className="text-xs font-medium text-text-tertiary uppercase letter-spacing-wider">Olho Esquerdo (OE)</p>
                                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                                        <div><span className="text-text-tertiary">Esf:</span> {os.prescription.os_sphere || "0.00"}</div>
                                        <div><span className="text-text-tertiary">Cil:</span> {os.prescription.os_cylinder || "0.00"}</div>
                                        <div><span className="text-text-tertiary">Eixo:</span> {os.prescription.os_axis || "0"}°</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-text-tertiary">Nenhuma receita vinculada.</p>
                        )}

                        {os.notes && (
                            <div className="mt-6 border-t border-border pt-6">
                                <p className="text-sm font-medium text-text-primary">Observações:</p>
                                <p className="mt-2 text-sm text-text-secondary">{os.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center text-sm font-semibold text-text-primary">
                                <User className="mr-2 h-4 w-4 text-brand-500" />
                                Cliente
                            </h3>
                            <Link
                                href={`/dashboard/clientes/${os.customer_id}`}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                                Ver Perfil
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-text-primary">{os.customer?.name}</p>
                            <p className="text-xs text-text-tertiary">{os.customer?.phone}</p>
                        </div>
                    </div>

                    {/* Workflow Info */}
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <h3 className="mb-4 flex items-center text-sm font-semibold text-text-primary">
                            <Calendar className="mr-2 h-4 w-4 text-brand-500" />
                            Prazos e Lab
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-tertiary">Laboratório:</span>
                                <span className="font-medium text-text-secondary">{os.lab_name || "Não informado"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-tertiary">Previsão:</span>
                                <span className="font-medium text-brand-600">
                                    {os.expected_at ? format(new Date(os.expected_at), "dd/MM/yyyy") : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
