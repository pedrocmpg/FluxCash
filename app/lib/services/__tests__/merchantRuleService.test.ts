import { DatabaseSync } from 'node:sqlite';
import { MerchantRuleService } from '../merchantRuleService';

function makeTestDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE merchant_rules (
      document TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  return db;
}

describe('MerchantRuleService', () => {
  it('returns null when no rule exists for a document', () => {
    const db = makeTestDb();
    expect(MerchantRuleService.getCategory(db, '11222333000181')).toBeNull();
  });

  it('persists and retrieves a rule by document', () => {
    const db = makeTestDb();
    MerchantRuleService.setCategory(db, '11222333000181', 'Alimentação');
    expect(MerchantRuleService.getCategory(db, '11222333000181')).toBe('Alimentação');
  });

  it('overwrites the category when the same document is set again', () => {
    const db = makeTestDb();
    MerchantRuleService.setCategory(db, '11222333000181', 'Alimentação');
    MerchantRuleService.setCategory(db, '11222333000181', 'Lazer');
    expect(MerchantRuleService.getCategory(db, '11222333000181')).toBe('Lazer');
  });
});
