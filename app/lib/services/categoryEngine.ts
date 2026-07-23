import { Category, InvestmentType, TransactionCreate } from '@/types/transaction';
import { normalizeText } from '@/lib/utils/normalizeText';

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

export class CategoryEngine {
  static suggestCategory(description: string): Category {
    const normalized = normalizeText(description);

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
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
  ): TransactionCreate {
    const isJoint = this.isJointTransaction(payload.description);

    const category =
      !payload.category || payload.category === 'Outros'
        ? this.suggestCategory(payload.description)
        : payload.category;

    const investment_type = isJoint ? 'Conjunto' : payload.investment_type || 'N/A';

    return {
      value: payload.value ?? 0,
      description: payload.description,
      category,
      type: payload.type ?? 'despesa',
      investment_type,
    };
  }
}
