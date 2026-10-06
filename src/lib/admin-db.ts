import { Pool } from "pg";

const globalForAdminDb = globalThis as typeof globalThis & { adminPool?: Pool };

export const adminPool = globalForAdminDb.adminPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (import.meta.env?.DEV) globalForAdminDb.adminPool = adminPool;

export type AdminUser = {
  id: string;
  name: string;
  role: string;
  groupName: string;
  status: string;
};

export async function listAdminUsers() {
  const result = await adminPool.query<AdminUser>(
    "SELECT id, name, role, group_name AS \"groupName\", status FROM admin_users ORDER BY created_at DESC",
  );
  return result.rows;
}

export async function createAuditEntry(action: string, actor = "Admin") {
  await adminPool.query(
    "INSERT INTO admin_audit_log (action, actor, details) VALUES ($1, $2, $3)",
    [action, actor, "Control center action"],
  );
}

export async function updateAdminUserRole(id: string, role: string) {
  await adminPool.query("UPDATE admin_users SET role = $1 WHERE id = $2", [role, id]);
  await createAuditEntry(`Changed role to ${role}`);
}

export async function saveAdminSetting(key: string, value: unknown) {
  await adminPool.query(
    "INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()",
    [key, JSON.stringify(value)],
  );
  await createAuditEntry(`Saved setting ${key}`);
}
