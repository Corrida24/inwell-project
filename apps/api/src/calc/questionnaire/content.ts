/**
 * Backend-only локализованные подписи для корпоративной агрегации
 * (corporateAggregation.ts) — заголовок сводного балла + подписи подшкал,
 * показываемые в таблице результатов компании. Тот же приём, что и
 * calc/content.ts для фитнес-теста (математика отдельно от текста), но
 * набор строк здесь маленький — полный текст вопросов/описаний теста
 * (что сотрудник читает при прохождении) живёт во frontend i18n
 * (apps/web/src/i18n/{ru,uz}.ts, t.tests.<key>), не здесь.
 */
import type { Lang } from '../computeReport.js';
import type { TestKey } from './types.js';

interface TestLabelContent {
  headlineLabel: string;
  subscales: Record<string, string>;
}

export const TEST_LABEL_CONTENT: Record<Lang, Record<TestKey, TestLabelContent>> = {
  ru: {
    loyalty: { headlineLabel: 'Индекс лояльности (eNPS-подобный)', subscales: {} },
    burnout: {
      headlineLabel: 'Риск выгорания',
      subscales: {
        exhaustion: 'Эмоциональное истощение',
        cynicism: 'Цинизм / отстранённость',
        accomplishment: 'Снижение результативности',
      },
    },
    turnover: { headlineLabel: 'Риск увольнения', subscales: {} },
    wellbeing: { headlineLabel: 'Индекс благополучия', subscales: {} },
    psychSafety: { headlineLabel: 'Индекс психологической безопасности', subscales: {} },
  },
  uz: {
    loyalty: { headlineLabel: 'Sodiqlik indeksi (eNPS uslubida)', subscales: {} },
    burnout: {
      headlineLabel: 'Kuyish xavfi',
      subscales: {
        exhaustion: 'Hissiy charchash',
        cynicism: 'Sinizm / distansiyalanish',
        accomplishment: 'Samaradorlikning pasayishi',
      },
    },
    turnover: { headlineLabel: 'Ishdan ketish xavfi', subscales: {} },
    wellbeing: { headlineLabel: 'Farovonlik indeksi', subscales: {} },
    psychSafety: { headlineLabel: 'Psixologik xavfsizlik indeksi', subscales: {} },
  },
};
