import { DatabaseSync } from 'node:sqlite';
import { Category } from '@/types/transaction';

export class MerchantRuleService {
  static getCategory(db: DatabaseSync, document: string): Category | null {
    const row = db
      .prepare('SELECT category FROM merchant_rules WHERE document = :document')
      .get({ document }) as { category: Category } | undefined;

    return row?.category ?? null;
  }

  static setCategory(db: DatabaseSync, document: string, category: Category): void {
    db.prepare(
      `INSERT INTO merchant_rules (document, category, updated_at)
       VALUES (:document, :category, :updated_at)
       ON CONFLICT(document) DO UPDATE SET category = :category, updated_at = :updated_at`,
    ).run({ document, category, updated_at: new Date().toISOString() });
  }
}
