// ============================================================================
// Members Module - Invite Member Form
// ============================================================================

"use client";

import { useState } from "react";
import { Button, Input, Label, Select } from "@/shared/ui/components";
import type { Role } from "@/core/types";

interface InviteMemberFormProps {
  roles: Role[];
  onSubmit: (email: string, roleId: string) => Promise<void>;
  onCancel: () => void;
}

export function InviteMemberForm({
  roles,
  onSubmit,
  onCancel,
}: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(email, roleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao convidar membro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="invite-role">Cargo</Label>
        <Select
          id="invite-role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Convidando..." : "Convidar"}
        </Button>
      </div>
    </form>
  );
}
