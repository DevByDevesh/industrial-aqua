import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase/client';

// Append-only record of important administrative changes (product edits,
// price/stock changes, archive/delete, order status and payment status
// changes). Written best-effort from the admin UI: a failed log write must
// never block the admin's actual change. Firestore rules restrict the
// auditLog collection to the store admin (create + read; no update or
// delete for anyone), so entries cannot be rewritten from the browser.
export interface AuditEntry {
  id?: string;
  actor: string;
  action: string;
  entity: string;
  summary: string;
  at: string;
}

export async function logAdminAction(actor: string, action: string, entity: string, summary: string): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'auditLog'), {
      actor,
      action,
      entity,
      summary,
      at: new Date().toISOString(),
    } satisfies Omit<AuditEntry, 'id'>);
  } catch {
    // Best-effort by design — the change itself already succeeded.
  }
}
