import { DatabaseSync } from 'node:sqlite';
import { Category, InvestmentType, TransactionCreate } from '@/types/transaction';
import { normalizeText } from '@/lib/utils/normalizeText';
import { MerchantRuleService } from './merchantRuleService';

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'Outros'>, string[]> = {
  Alimentação: [
    'mercado',
    'supermercado',
    'restaurante',
    'lanche',
    'ifood',
    'padaria',
    'acougue',
    'feira',
  ],
  Transporte: [
    'uber',
    '99',
    'onibus',
    'metro',
    'gasolina',
    'combustivel',
    'estacionamento',
    'pedagio',
  ],
  Saúde: ['farmacia', 'medico', 'consulta', 'hospital', 'plano de saude', 'exame', 'dentista'],
  Educação: [
    'curso',
    'faculdade',
    'livro',
    'escola',
    'mensalidade',
    'udemy',
    'alura',
    'treinamento',
  ],
  Lazer: ['cinema', 'netflix', 'spotify', 'show', 'viagem', 'hotel', 'jogo', 'streaming'],
  Moradia: ['aluguel', 'condominio', 'agua', 'luz', 'energia', 'internet', 'gas', 'iptu'],
  Investimento: ['tesouro', 'acoes', 'fundo', 'cdb', 'poupanca', 'cripto', 'dividendo', 'acao'],
  Receita: ['salario', 'freelance', 'renda', 'pagamento', 'transferencia recebida', 'bonus'],
};

const CONJUNTO_REGEX = /#conjunto\b/i;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(normalized: string, keyword: string): boolean {
  const pattern = new RegExp(`(?<![a-z0-9])${escapeRegExp(keyword)}(?![a-z0-9])`);
  return pattern.test(normalized);
}

export class CategoryEngine {
  static suggestCategory(description: string): Category {
    const normalized = normalizeText(description);

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((keyword) => matchesKeyword(normalized, keyword))) {
        return category as Category;
      }
    }

    return 'Outros';
  }

  static isJointTransaction(description: string): boolean {
    return CONJUNTO_REGEX.test(description);
  }

  static detectInvestmentType(description: string): InvestmentType {
    return this.isJointTransaction(description) ? 'Conjunto' : 'N/A';
  }

  static processTransaction(
    payload: Partial<TransactionCreate> & { description: string },
    db?: DatabaseSync,
  ): TransactionCreate {
    const isJoint = this.isJointTransaction(payload.description);

    let category = payload.category;

    if (!category || category === 'Outros') {
      const ruleCategory =
        db && payload.document ? MerchantRuleService.getCategory(db, payload.document) : null;
      category = ruleCategory ?? this.suggestCategory(payload.description);
    }

    const investment_type = isJoint ? 'Conjunto' : payload.investment_type || 'N/A';

    return {
      value: payload.value ?? 0,
      description: payload.description,
      category,
      type: payload.type ?? 'despesa',
      investment_type,
      external_id: payload.external_id ?? null,
    };
  }
}
