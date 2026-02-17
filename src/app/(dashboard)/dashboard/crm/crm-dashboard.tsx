"use client";
import { useState, useCallback } from "react";
import {
  createAutomationAction,
  updateAutomationAction,
  deleteAutomationAction,
  type CrmAutomation,
} from "@/modules/core/crm/actions/crm";

const TRIGGER_LABELS: Record<string, string> = {
  post_purchase: "Pós-compra",
  birthday: "Aniversário",
  prescription_expiring: "Receita expirando",
  inactivity: "Inatividade",
  nps_detractor: "NPS detrator",
  lens_reorder: "Reposição de lentes",
  abandoned_cart: "Carrinho abandonado",
};

const ACTION_LABELS: Record<string, string> = {
  whatsapp_message: "Mensagem WhatsApp",
  email: "E-mail",
  internal_alert: "Alerta interno",
  tag_customer: "Marcar cliente",
};

interface CrmDashboardProps {
  storeId: string;
  initialAutomations: CrmAutomation[];
}

export function CrmDashboard({
  storeId,
  initialAutomations,
}: CrmDashboardProps) {
  const [automations, setAutomations] =
    useState<CrmAutomation[]>(initialAutomations);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("post_purchase");
  const [actionType, setActionType] = useState("whatsapp_message");
  const [delayHours, setDelayHours] = useState(0);
  const [template, setTemplate] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setTriggerType("post_purchase");
    setActionType("whatsapp_message");
    setDelayHours(0);
    setTemplate("");
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const result = await updateAutomationAction({
        id: editingId,
        storeId,
        name,
        triggerType,
        actionType,
        delayHours,
        template: template || null,
      });
      if (result.success && result.data) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === editingId ? result.data! : a))
        );
      }
    } else {
      const result = await createAutomationAction({
        storeId,
        name,
        triggerType,
        actionType,
        delayHours,
        template: template || undefined,
      });
      if (result.success && result.data) {
        setAutomations((prev) => [result.data!, ...prev]);
      }
    }

    resetForm();
  };

  const handleEdit = (automation: CrmAutomation) => {
    setEditingId(automation.id);
    setName(automation.name);
    setTriggerType(automation.trigger_type);
    setActionType(automation.action_type);
    setDelayHours(automation.delay_hours);
    setTemplate(automation.template ?? "");
    setShowForm(true);
  };

  const handleToggle = async (automation: CrmAutomation) => {
    const result = await updateAutomationAction({
      id: automation.id,
      storeId,
      isActive: !automation.is_active,
    });
    if (result.success && result.data) {
      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? result.data! : a))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta automação?")) return;
    const result = await deleteAutomationAction(storeId, id);
    if (result.success) {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automações CRM</h1>
          <p className="text-muted-foreground">
            Configure mensagens automáticas para engajar seus clientes.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nova Automação
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Editar Automação" : "Nova Automação"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Agradecimento pós-compra"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Gatilho
                </label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Ação</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {Object.entries(ACTION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Atraso (horas)
                </label>
                <input
                  type="number"
                  value={delayHours}
                  onChange={(e) =>
                    setDelayHours(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  min={0}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Template da mensagem
              </label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Olá {{nome}}, obrigado pela compra na {{loja}}!"
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Variáveis disponíveis: {"{{nome}}"}, {"{{loja}}"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {editingId ? "Salvar" : "Criar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {automations.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center">
          <p className="text-zinc-500">Nenhuma automação configurada.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Crie automações para engajar seus clientes automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((automation) => (
            <div
              key={automation.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{automation.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      automation.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {automation.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {TRIGGER_LABELS[automation.trigger_type] ??
                    automation.trigger_type}{" "}
                  →{" "}
                  {ACTION_LABELS[automation.action_type] ??
                    automation.action_type}
                  {automation.delay_hours > 0 &&
                    ` (após ${automation.delay_hours}h)`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(automation)}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                >
                  {automation.is_active ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => handleEdit(automation)}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(automation.id)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
