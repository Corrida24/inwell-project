import type { FullReport } from './types';

// ---------------------------------------------------------------------------
// Статичные данные для /example — демо-отчёт БЕЗ подключения к базе данных.
// Сгенерированы через реальный движок apps/api/src/calc/computeReport.ts
// (computeFullReport), поэтому все проценты/перцентили/зоны/выводы устроены
// ТОЧНО так же, как в настоящем отчёте — просто вместо запроса к БД тут
// готовый объект. История (42 → 54 → 68) описывает мужчину 37 лет, который
// измерялся 3 раза за последние 6 месяцев в процессе тренировок.
// ---------------------------------------------------------------------------

export interface ExampleHistoryPoint {
  /** ISO-дата замера. */
  date: string;
  /** Inwell Score на момент этого замера. */
  score: number;
}

/** 3 точки истории для мини-таймлайна на /example: 42 → 54 → 68 за ~6 месяцев. */
export const EXAMPLE_HISTORY: ExampleHistoryPoint[] = [
  { date: '2026-02-18T09:00:00.000Z', score: 42 },
  { date: '2026-05-18T09:00:00.000Z', score: 54 },
  { date: '2026-08-18T09:00:00.000Z', score: 68 },
];

export const EXAMPLE_REPORT_RU: FullReport = {
  "measuredAt": "2026-08-18T09:00:00.000Z",
  "age": 37,
  "gender": "M",
  "activityKey": "moderate",
  "inwellScore": 68,
  "inwellScoreBand": {
    "label": "Норма",
    "level": 2
  },
  "inwellScorePercentile": 50,
  "inwellScoreGauge": {
    "domainMin": 24,
    "domainMax": 96,
    "zones": [
      {
        "from": 24,
        "to": 44,
        "color": "red"
      },
      {
        "from": 44,
        "to": 50,
        "color": "amber"
      },
      {
        "from": 50,
        "to": 70,
        "color": "green"
      },
      {
        "from": 70,
        "to": 76,
        "color": "amber"
      },
      {
        "from": 76,
        "to": 96,
        "color": "red"
      }
    ],
    "value": 68
  },
  "conclusion": "Ваш общий балл Inwell Score составляет 68 из максимально возможных 100 — это средний, в целом приемлемый результат. Это выше, чем у 50% участников вашего пола в базе Inwell. Индекс массы тела — 27,0 (категория: «избыточный вес»). Масса тела 85,6 кг выше, чем у 75% людей вашего пола (по справочным популяционным ориентирам). Подробный разбор каждого показателя — ниже.",
  "referenceAgeLabel": "35–44",
  "rawMeasurements": [
    {
      "key": "height",
      "label": "Рост",
      "unit": "см",
      "value": 178,
      "genderPercentile": 86,
      "inwellPercentile": 1,
      "populationRange": {
        "mean": 170.5,
        "sd": 7
      }
    },
    {
      "key": "weight",
      "label": "Вес тела",
      "unit": "кг",
      "value": 85.6,
      "genderPercentile": 75,
      "inwellPercentile": 56,
      "populationRange": {
        "mean": 77,
        "sd": 13
      }
    },
    {
      "key": "waist",
      "label": "Обхват талии",
      "unit": "см",
      "value": 93.7,
      "genderPercentile": 53,
      "inwellPercentile": 50,
      "populationRange": {
        "mean": 93,
        "sd": 11
      }
    },
    {
      "key": "hip",
      "label": "Обхват бёдер",
      "unit": "см",
      "value": 98.9,
      "genderPercentile": 45,
      "inwellPercentile": 61,
      "populationRange": {
        "mean": 100,
        "sd": 8
      }
    },
    {
      "key": "chest",
      "label": "Обхват груди",
      "unit": "см",
      "value": 106.2,
      "genderPercentile": 78,
      "inwellPercentile": 78,
      "populationRange": {
        "mean": 100,
        "sd": 8
      }
    },
    {
      "key": "neck",
      "label": "Обхват шеи",
      "unit": "см",
      "value": 39.5,
      "genderPercentile": 63,
      "inwellPercentile": 56,
      "populationRange": {
        "mean": 38.5,
        "sd": 3
      }
    },
    {
      "key": "bicepsR",
      "label": "Обхват правого бицепса",
      "unit": "см",
      "value": 35.5,
      "genderPercentile": 79,
      "inwellPercentile": 61,
      "populationRange": {
        "mean": 32.7,
        "sd": 3.5
      }
    },
    {
      "key": "bicepsL",
      "label": "Обхват левого бицепса",
      "unit": "см",
      "value": 35,
      "genderPercentile": 74,
      "inwellPercentile": 56,
      "populationRange": {
        "mean": 32.7,
        "sd": 3.5
      }
    },
    {
      "key": "thighR",
      "label": "Обхват правой ноги (бедра)",
      "unit": "см",
      "value": 56.9,
      "genderPercentile": 62,
      "inwellPercentile": 67,
      "populationRange": {
        "mean": 55,
        "sd": 6
      }
    },
    {
      "key": "thighL",
      "label": "Обхват левой ноги (бедра)",
      "unit": "см",
      "value": 56.4,
      "genderPercentile": 59,
      "inwellPercentile": 67,
      "populationRange": {
        "mean": 55,
        "sd": 6
      }
    }
  ],
  "metrics": [
    {
      "key": "bmi",
      "label": "BMI (индекс массы тела)",
      "unit": "",
      "value": 27.02,
      "range": {
        "min": 18.5,
        "max": 25,
        "text": "18.5 – 25"
      },
      "score": 79.80000000000001,
      "band": {
        "label": "Хорошо",
        "level": 3
      },
      "risk": {
        "label": "Низкий риск",
        "color": "good"
      },
      "hasCategory": true,
      "gauge": {
        "domainMin": 10.049999999999999,
        "domainMax": 33.45,
        "zones": [
          {
            "from": 10.049999999999999,
            "to": 16.55,
            "color": "red"
          },
          {
            "from": 16.55,
            "to": 18.5,
            "color": "amber"
          },
          {
            "from": 18.5,
            "to": 25,
            "color": "green"
          },
          {
            "from": 25,
            "to": 26.95,
            "color": "amber"
          },
          {
            "from": 26.95,
            "to": 33.45,
            "color": "red"
          }
        ],
        "value": 27.02
      },
      "description": "Отношение веса к росту в квадрате. Простой и самый распространённый индикатор формы — но не различает мышцы и жир, поэтому у спортивных людей может быть завышен.",
      "shortDescription": "Соотношение веса и роста.",
      "genderPercentile": 67,
      "inwellPercentile": 56
    },
    {
      "key": "whtr",
      "label": "WHtR (талия / рост)",
      "unit": "",
      "value": 0.53,
      "range": {
        "min": 0.4,
        "max": 0.5,
        "text": "0.40 – 0.50"
      },
      "score": 79.99999999999999,
      "band": {
        "label": "Хорошо",
        "level": 3
      },
      "risk": {
        "label": "Низкий риск",
        "color": "good"
      },
      "hasCategory": true,
      "gauge": {
        "domainMin": 0.27,
        "domainMax": 0.63,
        "zones": [
          {
            "from": 0.27,
            "to": 0.37000000000000005,
            "color": "red"
          },
          {
            "from": 0.37000000000000005,
            "to": 0.4,
            "color": "amber"
          },
          {
            "from": 0.4,
            "to": 0.5,
            "color": "green"
          },
          {
            "from": 0.5,
            "to": 0.53,
            "color": "amber"
          },
          {
            "from": 0.53,
            "to": 0.63,
            "color": "red"
          }
        ],
        "value": 0.53
      },
      "description": "Соотношение обхвата талии к росту. Считается одним из лучших простых индикаторов распределения жира в области живота — точнее BMI отражает форму тела.",
      "shortDescription": "Соотношение окружности талии и роста.",
      "genderPercentile": 63,
      "inwellPercentile": 50
    },
    {
      "key": "whr",
      "label": "WHR (талия / бёдра)",
      "unit": "",
      "value": 0.95,
      "range": {
        "min": 0.7,
        "max": 0.9,
        "text": "0.70 – 0.90"
      },
      "score": 50.00000000000006,
      "band": {
        "label": "Норма",
        "level": 2
      },
      "risk": {
        "label": "Средний риск",
        "color": "warn"
      },
      "hasCategory": true,
      "gauge": {
        "domainMin": 0.43999999999999984,
        "domainMax": 1.1600000000000001,
        "zones": [
          {
            "from": 0.43999999999999984,
            "to": 0.6399999999999999,
            "color": "red"
          },
          {
            "from": 0.6399999999999999,
            "to": 0.7,
            "color": "amber"
          },
          {
            "from": 0.7,
            "to": 0.9,
            "color": "green"
          },
          {
            "from": 0.9,
            "to": 0.9600000000000001,
            "color": "amber"
          },
          {
            "from": 0.9600000000000001,
            "to": 1.1600000000000001,
            "color": "red"
          }
        ],
        "value": 0.95
      },
      "description": "Соотношение обхвата талии к обхвату бёдер. Показывает тип распределения жира — по типу \"яблоко\" (в районе живота) или \"груша\" (в районе бёдер).",
      "shortDescription": "Соотношение талии и бёдер.",
      "genderPercentile": 87,
      "inwellPercentile": 1
    },
    {
      "key": "bai",
      "label": "BAI (индекс адипозности тела)",
      "unit": "",
      "value": 23.65,
      "range": {
        "min": 8,
        "max": 21,
        "text": "8 – 21"
      },
      "score": 66.87500000000001,
      "band": {
        "label": "Норма",
        "level": 2
      },
      "risk": {
        "label": "Средний риск",
        "color": "warn"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0,
        "domainMax": 37.900000000000006,
        "zones": [
          {
            "from": 0,
            "to": 4.1,
            "color": "red"
          },
          {
            "from": 4.1,
            "to": 8,
            "color": "amber"
          },
          {
            "from": 8,
            "to": 21,
            "color": "green"
          },
          {
            "from": 21,
            "to": 24.9,
            "color": "amber"
          },
          {
            "from": 24.9,
            "to": 37.900000000000006,
            "color": "red"
          }
        ],
        "value": 23.65
      },
      "description": "Оценивает долю жира в теле через обхват бёдер и рост, без необходимости взвешивания. Хорошо дополняет BMI, особенно там, где важна форма тела, а не только вес.",
      "shortDescription": "Оценка доли жира по бёдрам и росту, без веса.",
      "genderPercentile": 61,
      "inwellPercentile": 61
    },
    {
      "key": "bri",
      "label": "BRI (индекс округлости тела)",
      "unit": "",
      "value": 3.87,
      "range": {
        "min": 1,
        "max": 3.4,
        "text": "1.0 – 3.4"
      },
      "score": 86.57142857142857,
      "band": {
        "label": "Отлично",
        "level": 4
      },
      "risk": {
        "label": "Низкий риск",
        "color": "good"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0,
        "domainMax": 6.52,
        "zones": [
          {
            "from": 0,
            "to": 0.28,
            "color": "red"
          },
          {
            "from": 0.28,
            "to": 1,
            "color": "amber"
          },
          {
            "from": 1,
            "to": 3.4,
            "color": "green"
          },
          {
            "from": 3.4,
            "to": 4.12,
            "color": "amber"
          },
          {
            "from": 4.12,
            "to": 6.52,
            "color": "red"
          }
        ],
        "value": 3.87
      },
      "description": "Геометрическая модель формы тела на основе талии и роста. Чем ближе к 0, тем более вытянутая (узкая) форма тела; чем выше — тем более округлая.",
      "shortDescription": "Насколько округлая форма тела, по талии и росту.",
      "genderPercentile": 44,
      "inwellPercentile": 50
    },
    {
      "key": "absi",
      "label": "ABSI (индекс формы тела)",
      "unit": "",
      "value": 0.078,
      "range": {
        "min": 0.07,
        "max": 0.086,
        "text": "0.070 – 0.086"
      },
      "score": 100,
      "band": {
        "label": "Отлично",
        "level": 4
      },
      "risk": {
        "label": "Низкий риск",
        "color": "good"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0.04920000000000002,
        "domainMax": 0.10679999999999998,
        "zones": [
          {
            "from": 0.04920000000000002,
            "to": 0.06520000000000001,
            "color": "red"
          },
          {
            "from": 0.06520000000000001,
            "to": 0.07,
            "color": "amber"
          },
          {
            "from": 0.07,
            "to": 0.086,
            "color": "green"
          },
          {
            "from": 0.086,
            "to": 0.09079999999999999,
            "color": "amber"
          },
          {
            "from": 0.09079999999999999,
            "to": 0.10679999999999998,
            "color": "red"
          }
        ],
        "value": 0.078
      },
      "description": "Учитывает обхват талии относительно BMI и роста. Показывает риски, независимые от общей массы тела — то есть работает даже при нормальном BMI.",
      "shortDescription": "Форма тела независимо от общего веса.",
      "genderPercentile": 37,
      "inwellPercentile": 39
    },
    {
      "key": "ci",
      "label": "Индекс конусности (CI)",
      "unit": "",
      "value": 1.24,
      "range": {
        "min": 1,
        "max": 1.18,
        "text": "1.00 – 1.18"
      },
      "score": 59.99999999999994,
      "band": {
        "label": "Норма",
        "level": 2
      },
      "risk": {
        "label": "Средний риск",
        "color": "warn"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0.766,
        "domainMax": 1.414,
        "zones": [
          {
            "from": 0.766,
            "to": 0.9460000000000001,
            "color": "red"
          },
          {
            "from": 0.9460000000000001,
            "to": 1,
            "color": "amber"
          },
          {
            "from": 1,
            "to": 1.18,
            "color": "green"
          },
          {
            "from": 1.18,
            "to": 1.234,
            "color": "amber"
          },
          {
            "from": 1.234,
            "to": 1.414,
            "color": "red"
          }
        ],
        "value": 1.24
      },
      "description": "Сравнивает форму тела с идеальным цилиндром. Значение ближе к 1.0 означает более \"цилиндрическую\" (равномерную) форму, значения выше — смещение массы к талии.",
      "shortDescription": "Насколько тело близко по форме к цилиндру.",
      "genderPercentile": 37,
      "inwellPercentile": 39
    },
    {
      "key": "avi",
      "label": "AVI (абдоминальный объёмный индекс)",
      "unit": "",
      "value": 17.58,
      "range": {
        "min": 10,
        "max": 16,
        "text": "10 – 16"
      },
      "score": 80.25000000000003,
      "band": {
        "label": "Хорошо",
        "level": 3
      },
      "risk": {
        "label": "Низкий риск",
        "color": "good"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 2.1999999999999993,
        "domainMax": 23.8,
        "zones": [
          {
            "from": 2.1999999999999993,
            "to": 8.2,
            "color": "red"
          },
          {
            "from": 8.2,
            "to": 10,
            "color": "amber"
          },
          {
            "from": 10,
            "to": 16,
            "color": "green"
          },
          {
            "from": 16,
            "to": 17.8,
            "color": "amber"
          },
          {
            "from": 17.8,
            "to": 23.8,
            "color": "red"
          }
        ],
        "value": 17.58
      },
      "description": "Оценивает объём в области живота на основе талии и бёдер. Дополняет WHtR и WHR ещё одним взглядом на распределение массы в центральной части тела.",
      "shortDescription": "Оценка объёма в области живота.",
      "genderPercentile": 46,
      "inwellPercentile": 50
    },
    {
      "key": "vat",
      "label": "Висцеральный жир (расчётная площадь)",
      "unit": "см²",
      "value": 142.8,
      "range": {
        "min": 0,
        "max": 100,
        "text": "0 – 100"
      },
      "score": 28.666666666666647,
      "band": {
        "label": "Требует внимания",
        "level": 0
      },
      "risk": {
        "label": "Повышенный риск",
        "color": "danger"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0,
        "domainMax": 230,
        "zones": [
          {
            "from": 0,
            "to": -30,
            "color": "red"
          },
          {
            "from": -30,
            "to": 0,
            "color": "amber"
          },
          {
            "from": 0,
            "to": 100,
            "color": "green"
          },
          {
            "from": 100,
            "to": 130,
            "color": "amber"
          },
          {
            "from": 130,
            "to": 230,
            "color": "red"
          }
        ],
        "value": 142.8
      },
      "description": "Расчётная площадь жира вокруг внутренних органов. Эта форма жира энергетически наиболее активна и теснее всего связана с общим уровнем энергии и метаболической формой.",
      "shortDescription": "Расчётная площадь жира вокруг внутренних органов.",
      "genderPercentile": 65,
      "inwellPercentile": 50
    }
  ],
  "bodyFat": {
    "label": "Расчётный процент жировой массы",
    "value": 21.7,
    "unit": "%",
    "category": "average",
    "categoryLabel": "Средний уровень",
    "referencePercentile": 37,
    "inwellPercentile": 50,
    "description": "Оценка доли жировой массы по методу US Navy — считается по обхватам шеи, талии (и бёдер у женщин), без смарт-весов и калипера. Это расчётная оценка, а не прямое измерение и не показания умных весов.",
    "shortDescription": "Расчётная доля жировой массы тела."
  },
  "bsa": {
    "value": 2.04,
    "unit": "м²",
    "description": "Оценочная площадь поверхности тела по формуле Дюбуа. Описательный показатель без оценки \"хорошо/плохо\" — используется как вспомогательный при расчёте базового обмена.",
    "shortDescription": "Оценочная площадь поверхности тела."
  },
  "energy": {
    "bmr": {
      "value": 1883,
      "unit": "ккал/сутки",
      "description": "Оценка количества калорий, которые ваш организм расходует в состоянии полного покоя."
    },
    "tdee": {
      "value": 2919,
      "unit": "ккал/сутки",
      "description": "Оценка суточного расхода энергии с учётом указанной вами частоты физической активности."
    }
  },
  "symmetry": {
    "thigh": {
      "key": "thigh",
      "unit": "см",
      "right": 56.9,
      "left": 56.4,
      "diffAbs": 0.5,
      "diffPct": 0.9,
      "symmetryScore": 99,
      "largerSide": "right",
      "referenceSymmetryPercentile": 85,
      "inwellSymmetryPercentile": 28,
      "progress": {
        "previous": 0.9,
        "current": 0.9,
        "delta": 0,
        "direction": "flat"
      }
    },
    "biceps": {
      "key": "biceps",
      "unit": "см",
      "right": 35.5,
      "left": 35,
      "diffAbs": 0.5,
      "diffPct": 1.4,
      "symmetryScore": 99,
      "largerSide": "right",
      "referenceSymmetryPercentile": 85,
      "inwellSymmetryPercentile": 22,
      "progress": {
        "previous": 1.5,
        "current": 1.4,
        "delta": -0.1,
        "direction": "down"
      }
    }
  },
  "progress": {
    "isFirst": false,
    "previousDate": "2026-05-20T09:00:00.000Z",
    "raw": {
      "height": {
        "previous": 178,
        "current": 178,
        "delta": 0,
        "direction": "flat"
      },
      "weight": {
        "previous": 87.9,
        "current": 85.6,
        "delta": -2.3,
        "direction": "down"
      },
      "waist": {
        "previous": 97,
        "current": 93.7,
        "delta": -3.3,
        "direction": "down"
      },
      "hip": {
        "previous": 100.5,
        "current": 98.9,
        "delta": -1.6,
        "direction": "down"
      },
      "chest": {
        "previous": 104.9,
        "current": 106.2,
        "delta": 1.3,
        "direction": "up"
      },
      "neck": {
        "previous": 39.9,
        "current": 39.5,
        "delta": -0.4,
        "direction": "down"
      },
      "bicepsR": {
        "previous": 34.3,
        "current": 35.5,
        "delta": 1.2,
        "direction": "up"
      },
      "bicepsL": {
        "previous": 33.8,
        "current": 35,
        "delta": 1.2,
        "direction": "up"
      },
      "thighR": {
        "previous": 55.8,
        "current": 56.9,
        "delta": 1.1,
        "direction": "up"
      },
      "thighL": {
        "previous": 55.3,
        "current": 56.4,
        "delta": 1.1,
        "direction": "up"
      }
    },
    "metrics": {
      "bmi": {
        "previous": 27.74,
        "current": 27.02,
        "delta": -0.7,
        "direction": "down"
      },
      "whtr": {
        "previous": 0.54,
        "current": 0.53,
        "delta": -0.01,
        "direction": "down"
      },
      "whr": {
        "previous": 0.97,
        "current": 0.95,
        "delta": -0.02,
        "direction": "down"
      },
      "bai": {
        "previous": 24.32,
        "current": 23.65,
        "delta": -0.67,
        "direction": "down"
      },
      "bri": {
        "previous": 4.24,
        "current": 3.87,
        "delta": -0.37,
        "direction": "down"
      },
      "absi": {
        "previous": 0.0793,
        "current": 0.078,
        "delta": -0.0013,
        "direction": "down"
      },
      "ci": {
        "previous": 1.27,
        "current": 1.24,
        "delta": -0.03,
        "direction": "down"
      },
      "avi": {
        "previous": 18.83,
        "current": 17.58,
        "delta": -1.25,
        "direction": "down"
      },
      "vat": {
        "previous": 167.4,
        "current": 142.8,
        "delta": -24.6,
        "direction": "down"
      }
    },
    "bodyFat": {
      "previous": 23.6,
      "current": 21.7,
      "delta": -1.9,
      "direction": "down",
      "isPercentagePoints": true
    },
    "bsa": {
      "previous": 2.06,
      "current": 2.04,
      "delta": -0.02,
      "direction": "down"
    },
    "bmr": {
      "previous": 1915,
      "current": 1883,
      "delta": -32,
      "direction": "down"
    },
    "tdee": {
      "previous": 2968,
      "current": 2919,
      "delta": -49,
      "direction": "down"
    },
    "activity": {
      "previous": "moderate",
      "current": "moderate",
      "changed": false
    }
  },
  "importantInfo": [
    "Этот отчёт подготовлен сервисом Inwell на основе антропометрических замеров, которые вы указали сами, и не является медицинским исследованием, диагнозом или врачебным заключением. Отчёт не подтверждает и не опровергает наличие каких-либо заболеваний или состояний здоровья.",
    "Результаты получены неинвазивными антропометрическими формулами и могут заметно колебаться в зависимости от точности измерения, времени суток, приёма пищи и жидкости, уровня гидратации и других факторов. Разовый замер отражает ситуативную оценку, а не точную и постоянную характеристику организма.",
    "Формулы и диапазоны норм, используемые в расчётах (BMI, WHtR, WHR, BAI, BRI, ABSI, индекс конусности, AVI, оценка висцерального жира и др.), взяты из открытых научных и справочных источников. Это общепринятые приближения, которые могут содержать погрешность для отдельных категорий людей (спортсмены, пожилые люди, беременные и т.д.). Процентильные сравнения носят ориентировочный характер и зависят от объёма накопленных данных.",
    "Отчёт не содержит персональных рекомендаций и не заменяет консультацию врача, диетолога или тренера ЛФК. Для точной картины состояния здоровья обратитесь в лицензированное медицинское учреждение.",
    "Inwell не несёт ответственности за любые решения, действия или бездействие, предпринятые на основании данных, представленных в этом отчёте."
  ],
  "confidentiality": [
    "Ваши данные конфиденциальны. Inwell не публикует и не передаёт результаты замеров третьим лицам, не рассылает отчёты в интернете. Данные хранятся на защищённом сервере и привязаны к номеру телефона, который вы указали.",
    "Вы можете запросить удаление своих данных, написав на hello@inwell.uz."
  ]
};

export const EXAMPLE_REPORT_UZ: FullReport = {
  "measuredAt": "2026-08-18T09:00:00.000Z",
  "age": 37,
  "gender": "M",
  "activityKey": "moderate",
  "inwellScore": 68,
  "inwellScoreBand": {
    "label": "Meʼyor",
    "level": 2
  },
  "inwellScorePercentile": 50,
  "inwellScoreGauge": {
    "domainMin": 24,
    "domainMax": 96,
    "zones": [
      {
        "from": 24,
        "to": 44,
        "color": "red"
      },
      {
        "from": 44,
        "to": 50,
        "color": "amber"
      },
      {
        "from": 50,
        "to": 70,
        "color": "green"
      },
      {
        "from": 70,
        "to": 76,
        "color": "amber"
      },
      {
        "from": 76,
        "to": 96,
        "color": "red"
      }
    ],
    "value": 68
  },
  "conclusion": "Sizning umumiy Inwell Score balingiz 100 balldan 68 ni tashkil qiladi — bu oʻrtacha, umuman qoniqarli natija. Bu Inwell bazasidagi jinsingiz boʻyicha ishtirokchilarning 50% idan yuqori. Tana massa indeksi (BMI) — 27,0 (toifa: «ortiqcha vazn»). Tana vazningiz 85,6 kg — jinsingiz boʻyicha odamlarning 75% idan yuqori (umumiy populyatsion mezonlar boʻyicha). Har bir koʻrsatkichning batafsil tahlili quyida.",
  "referenceAgeLabel": "35–44",
  "rawMeasurements": [
    {
      "key": "height",
      "label": "Boʻy",
      "unit": "sm",
      "value": 178,
      "genderPercentile": 86,
      "inwellPercentile": 1,
      "populationRange": {
        "mean": 170.5,
        "sd": 7
      }
    },
    {
      "key": "weight",
      "label": "Tana vazni",
      "unit": "kg",
      "value": 85.6,
      "genderPercentile": 75,
      "inwellPercentile": 56,
      "populationRange": {
        "mean": 77,
        "sd": 13
      }
    },
    {
      "key": "waist",
      "label": "Bel aylanasi",
      "unit": "sm",
      "value": 93.7,
      "genderPercentile": 53,
      "inwellPercentile": 50,
      "populationRange": {
        "mean": 93,
        "sd": 11
      }
    },
    {
      "key": "hip",
      "label": "Son aylanasi",
      "unit": "sm",
      "value": 98.9,
      "genderPercentile": 45,
      "inwellPercentile": 61,
      "populationRange": {
        "mean": 100,
        "sd": 8
      }
    },
    {
      "key": "chest",
      "label": "Koʻkrak aylanasi",
      "unit": "sm",
      "value": 106.2,
      "genderPercentile": 78,
      "inwellPercentile": 78,
      "populationRange": {
        "mean": 100,
        "sd": 8
      }
    },
    {
      "key": "neck",
      "label": "Boʻyin aylanasi",
      "unit": "sm",
      "value": 39.5,
      "genderPercentile": 63,
      "inwellPercentile": 56,
      "populationRange": {
        "mean": 38.5,
        "sd": 3
      }
    },
    {
      "key": "bicepsR",
      "label": "Oʻng bilak (biceps) aylanasi",
      "unit": "sm",
      "value": 35.5,
      "genderPercentile": 79,
      "inwellPercentile": 61,
      "populationRange": {
        "mean": 32.7,
        "sd": 3.5
      }
    },
    {
      "key": "bicepsL",
      "label": "Chap bilak (biceps) aylanasi",
      "unit": "sm",
      "value": 35,
      "genderPercentile": 74,
      "inwellPercentile": 56,
      "populationRange": {
        "mean": 32.7,
        "sd": 3.5
      }
    },
    {
      "key": "thighR",
      "label": "Oʻng oyoq (son) aylanasi",
      "unit": "sm",
      "value": 56.9,
      "genderPercentile": 62,
      "inwellPercentile": 67,
      "populationRange": {
        "mean": 55,
        "sd": 6
      }
    },
    {
      "key": "thighL",
      "label": "Chap oyoq (son) aylanasi",
      "unit": "sm",
      "value": 56.4,
      "genderPercentile": 59,
      "inwellPercentile": 67,
      "populationRange": {
        "mean": 55,
        "sd": 6
      }
    }
  ],
  "metrics": [
    {
      "key": "bmi",
      "label": "BMI (tana massa indeksi)",
      "unit": "",
      "value": 27.02,
      "range": {
        "min": 18.5,
        "max": 25,
        "text": "18.5 – 25"
      },
      "score": 79.80000000000001,
      "band": {
        "label": "Yaxshi",
        "level": 3
      },
      "risk": {
        "label": "Past xavf",
        "color": "good"
      },
      "hasCategory": true,
      "gauge": {
        "domainMin": 10.049999999999999,
        "domainMax": 33.45,
        "zones": [
          {
            "from": 10.049999999999999,
            "to": 16.55,
            "color": "red"
          },
          {
            "from": 16.55,
            "to": 18.5,
            "color": "amber"
          },
          {
            "from": 18.5,
            "to": 25,
            "color": "green"
          },
          {
            "from": 25,
            "to": 26.95,
            "color": "amber"
          },
          {
            "from": 26.95,
            "to": 33.45,
            "color": "red"
          }
        ],
        "value": 27.02
      },
      "description": "Vaznning boʻyning kvadratiga nisbati. Eng oddiy va keng tarqalgan shakl koʻrsatkichi — lekin mushak va yogʻni farqlamaydi, shuning uchun sportchilarda yuqori chiqishi mumkin.",
      "shortDescription": "Vazn va boʻy nisbati.",
      "genderPercentile": 67,
      "inwellPercentile": 56
    },
    {
      "key": "whtr",
      "label": "WHtR (bel / boʻy)",
      "unit": "",
      "value": 0.53,
      "range": {
        "min": 0.4,
        "max": 0.5,
        "text": "0.40 – 0.50"
      },
      "score": 79.99999999999999,
      "band": {
        "label": "Yaxshi",
        "level": 3
      },
      "risk": {
        "label": "Past xavf",
        "color": "good"
      },
      "hasCategory": true,
      "gauge": {
        "domainMin": 0.27,
        "domainMax": 0.63,
        "zones": [
          {
            "from": 0.27,
            "to": 0.37000000000000005,
            "color": "red"
          },
          {
            "from": 0.37000000000000005,
            "to": 0.4,
            "color": "amber"
          },
          {
            "from": 0.4,
            "to": 0.5,
            "color": "green"
          },
          {
            "from": 0.5,
            "to": 0.53,
            "color": "amber"
          },
          {
            "from": 0.53,
            "to": 0.63,
            "color": "red"
          }
        ],
        "value": 0.53
      },
      "description": "Bel aylanasining boʻyga nisbati. Qorin sohasidagi yogʻ taqsimotining eng yaxshi oddiy koʻrsatkichlaridan biri — tana shaklini BMI dan aniqroq aks ettiradi.",
      "shortDescription": "Bel aylanasi va boʻy nisbati.",
      "genderPercentile": 63,
      "inwellPercentile": 50
    },
    {
      "key": "whr",
      "label": "WHR (bel / son)",
      "unit": "",
      "value": 0.95,
      "range": {
        "min": 0.7,
        "max": 0.9,
        "text": "0.70 – 0.90"
      },
      "score": 50.00000000000006,
      "band": {
        "label": "Meʼyor",
        "level": 2
      },
      "risk": {
        "label": "Oʻrtacha xavf",
        "color": "warn"
      },
      "hasCategory": true,
      "gauge": {
        "domainMin": 0.43999999999999984,
        "domainMax": 1.1600000000000001,
        "zones": [
          {
            "from": 0.43999999999999984,
            "to": 0.6399999999999999,
            "color": "red"
          },
          {
            "from": 0.6399999999999999,
            "to": 0.7,
            "color": "amber"
          },
          {
            "from": 0.7,
            "to": 0.9,
            "color": "green"
          },
          {
            "from": 0.9,
            "to": 0.9600000000000001,
            "color": "amber"
          },
          {
            "from": 0.9600000000000001,
            "to": 1.1600000000000001,
            "color": "red"
          }
        ],
        "value": 0.95
      },
      "description": "Bel aylanasining son aylanasiga nisbati. Yogʻ taqsimoti turini koʻrsatadi — \"olma\" turi (qorin atrofida) yoki \"nok\" turi (sonlar atrofida).",
      "shortDescription": "Bel va son aylanasi nisbati.",
      "genderPercentile": 87,
      "inwellPercentile": 1
    },
    {
      "key": "bai",
      "label": "BAI (tana yogʻlilik indeksi)",
      "unit": "",
      "value": 23.65,
      "range": {
        "min": 8,
        "max": 21,
        "text": "8 – 21"
      },
      "score": 66.87500000000001,
      "band": {
        "label": "Meʼyor",
        "level": 2
      },
      "risk": {
        "label": "Oʻrtacha xavf",
        "color": "warn"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0,
        "domainMax": 37.900000000000006,
        "zones": [
          {
            "from": 0,
            "to": 4.1,
            "color": "red"
          },
          {
            "from": 4.1,
            "to": 8,
            "color": "amber"
          },
          {
            "from": 8,
            "to": 21,
            "color": "green"
          },
          {
            "from": 21,
            "to": 24.9,
            "color": "amber"
          },
          {
            "from": 24.9,
            "to": 37.900000000000006,
            "color": "red"
          }
        ],
        "value": 23.65
      },
      "description": "Tortishdan foydalanmasdan, son aylanasi va boʻy orqali tanadagi yogʻ ulushini baholaydi. Tana shakli muhim boʻlgan hollarda BMI ni yaxshi toʻldiradi.",
      "shortDescription": "Son aylanasi va boʻy orqali yogʻ ulushi bahosi.",
      "genderPercentile": 61,
      "inwellPercentile": 61
    },
    {
      "key": "bri",
      "label": "BRI (tana dumaloqlik indeksi)",
      "unit": "",
      "value": 3.87,
      "range": {
        "min": 1,
        "max": 3.4,
        "text": "1.0 – 3.4"
      },
      "score": 86.57142857142857,
      "band": {
        "label": "Aʼlo",
        "level": 4
      },
      "risk": {
        "label": "Past xavf",
        "color": "good"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0,
        "domainMax": 6.52,
        "zones": [
          {
            "from": 0,
            "to": 0.28,
            "color": "red"
          },
          {
            "from": 0.28,
            "to": 1,
            "color": "amber"
          },
          {
            "from": 1,
            "to": 3.4,
            "color": "green"
          },
          {
            "from": 3.4,
            "to": 4.12,
            "color": "amber"
          },
          {
            "from": 4.12,
            "to": 6.52,
            "color": "red"
          }
        ],
        "value": 3.87
      },
      "description": "Bel va boʻy asosidagi tana shaklining geometrik modeli. 0 ga qancha yaqin boʻlsa, tana shakli shuncha choʻzilgan (ingichka); qancha yuqori boʻlsa, shuncha dumaloq.",
      "shortDescription": "Tananing qanchalik dumaloq shaklda ekani.",
      "genderPercentile": 44,
      "inwellPercentile": 50
    },
    {
      "key": "absi",
      "label": "ABSI (tana shakli indeksi)",
      "unit": "",
      "value": 0.078,
      "range": {
        "min": 0.07,
        "max": 0.086,
        "text": "0.070 – 0.086"
      },
      "score": 100,
      "band": {
        "label": "Aʼlo",
        "level": 4
      },
      "risk": {
        "label": "Past xavf",
        "color": "good"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0.04920000000000002,
        "domainMax": 0.10679999999999998,
        "zones": [
          {
            "from": 0.04920000000000002,
            "to": 0.06520000000000001,
            "color": "red"
          },
          {
            "from": 0.06520000000000001,
            "to": 0.07,
            "color": "amber"
          },
          {
            "from": 0.07,
            "to": 0.086,
            "color": "green"
          },
          {
            "from": 0.086,
            "to": 0.09079999999999999,
            "color": "amber"
          },
          {
            "from": 0.09079999999999999,
            "to": 0.10679999999999998,
            "color": "red"
          }
        ],
        "value": 0.078
      },
      "description": "BMI va boʻyga nisbatan bel aylanasini hisobga oladi. Umumiy tana vazniga bogʻliq boʻlmagan xavflarni koʻrsatadi — яъни BMI meʼyorida boʻlsa ham ishlaydi.",
      "shortDescription": "Umumiy vazndan mustaqil tana shakli.",
      "genderPercentile": 37,
      "inwellPercentile": 39
    },
    {
      "key": "ci",
      "label": "Konussimonlik indeksi (CI)",
      "unit": "",
      "value": 1.24,
      "range": {
        "min": 1,
        "max": 1.18,
        "text": "1.00 – 1.18"
      },
      "score": 59.99999999999994,
      "band": {
        "label": "Meʼyor",
        "level": 2
      },
      "risk": {
        "label": "Oʻrtacha xavf",
        "color": "warn"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0.766,
        "domainMax": 1.414,
        "zones": [
          {
            "from": 0.766,
            "to": 0.9460000000000001,
            "color": "red"
          },
          {
            "from": 0.9460000000000001,
            "to": 1,
            "color": "amber"
          },
          {
            "from": 1,
            "to": 1.18,
            "color": "green"
          },
          {
            "from": 1.18,
            "to": 1.234,
            "color": "amber"
          },
          {
            "from": 1.234,
            "to": 1.414,
            "color": "red"
          }
        ],
        "value": 1.24
      },
      "description": "Tana shaklini ideal silindr bilan solishtiradi. 1.0 ga yaqin qiymat — \"silindrsimon\" (bir tekis) shakl, yuqori qiymatlar — massaning bel tomon siljishi.",
      "shortDescription": "Tananing silindrga qanchalik yaqinligi.",
      "genderPercentile": 37,
      "inwellPercentile": 39
    },
    {
      "key": "avi",
      "label": "AVI (qorin hajmi indeksi)",
      "unit": "",
      "value": 17.58,
      "range": {
        "min": 10,
        "max": 16,
        "text": "10 – 16"
      },
      "score": 80.25000000000003,
      "band": {
        "label": "Yaxshi",
        "level": 3
      },
      "risk": {
        "label": "Past xavf",
        "color": "good"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 2.1999999999999993,
        "domainMax": 23.8,
        "zones": [
          {
            "from": 2.1999999999999993,
            "to": 8.2,
            "color": "red"
          },
          {
            "from": 8.2,
            "to": 10,
            "color": "amber"
          },
          {
            "from": 10,
            "to": 16,
            "color": "green"
          },
          {
            "from": 16,
            "to": 17.8,
            "color": "amber"
          },
          {
            "from": 17.8,
            "to": 23.8,
            "color": "red"
          }
        ],
        "value": 17.58
      },
      "description": "Bel va son asosida qorin sohasidagi hajmni baholaydi. WHtR va WHR ni tana markazidagi massa taqsimoti boʻyicha yana bir nuqtai nazar bilan toʻldiradi.",
      "shortDescription": "Qorin sohasidagi taxminiy hajm bahosi.",
      "genderPercentile": 46,
      "inwellPercentile": 50
    },
    {
      "key": "vat",
      "label": "Visseral yogʻ (hisoblangan maydon)",
      "unit": "sm²",
      "value": 142.8,
      "range": {
        "min": 0,
        "max": 100,
        "text": "0 – 100"
      },
      "score": 28.666666666666647,
      "band": {
        "label": "Eʼtibor talab qiladi",
        "level": 0
      },
      "risk": {
        "label": "Yuqori xavf",
        "color": "danger"
      },
      "hasCategory": false,
      "gauge": {
        "domainMin": 0,
        "domainMax": 230,
        "zones": [
          {
            "from": 0,
            "to": -30,
            "color": "red"
          },
          {
            "from": -30,
            "to": 0,
            "color": "amber"
          },
          {
            "from": 0,
            "to": 100,
            "color": "green"
          },
          {
            "from": 100,
            "to": 130,
            "color": "amber"
          },
          {
            "from": 130,
            "to": 230,
            "color": "red"
          }
        ],
        "value": 142.8
      },
      "description": "Ichki organlar atrofidagi yogʻning hisoblangan maydoni. Bu yogʻ turi energetik jihatdan eng faol boʻlib, umumiy energiya darajasi va metabolik holat bilan eng chambarchas bogʻliq.",
      "shortDescription": "Ichki organlar atrofidagi hisoblangan yogʻ maydoni.",
      "genderPercentile": 65,
      "inwellPercentile": 50
    }
  ],
  "bodyFat": {
    "label": "Hisoblangan tanadagi yogʻ foizi",
    "value": 21.7,
    "unit": "%",
    "category": "average",
    "categoryLabel": "Oʻrtacha daraja",
    "referencePercentile": 37,
    "inwellPercentile": 50,
    "description": "US Navy usuli boʻyicha baholangan yogʻ ulushi — boʻyin, bel (ayollarda son ham) aylanalari boʻyicha hisoblanadi, smart-tarozi yoki kaliper kerak emas. Bu hisoblangan baho, toʻgʻridan-toʻgʻri oʻlchov yoki aqlli tarozi koʻrsatkichi emas.",
    "shortDescription": "Tanadagi hisoblangan yogʻ massasi ulushi."
  },
  "bsa": {
    "value": 2.04,
    "unit": "m²",
    "description": "Dyubua formulasi boʻyicha baholangan tana yuzasi maydoni. \"Yaxshi/yomon\" bahosiz tavsifiy koʻrsatkich — asosiy almashinuvni hisoblashda yordamchi sifatida ishlatiladi.",
    "shortDescription": "Baholangan tana yuzasi maydoni."
  },
  "energy": {
    "bmr": {
      "value": 1883,
      "unit": "kkal/kun",
      "description": "Tanangiz toʻliq tinch holatda sarflaydigan taxminiy kaloriyalar soni."
    },
    "tdee": {
      "value": 2919,
      "unit": "kkal/kun",
      "description": "Siz koʻrsatgan jismoniy faollik chastotasini hisobga olgan holda kunlik energiya sarfi bahosi."
    }
  },
  "symmetry": {
    "thigh": {
      "key": "thigh",
      "unit": "sm",
      "right": 56.9,
      "left": 56.4,
      "diffAbs": 0.5,
      "diffPct": 0.9,
      "symmetryScore": 99,
      "largerSide": "right",
      "referenceSymmetryPercentile": 85,
      "inwellSymmetryPercentile": 28,
      "progress": {
        "previous": 0.9,
        "current": 0.9,
        "delta": 0,
        "direction": "flat"
      }
    },
    "biceps": {
      "key": "biceps",
      "unit": "sm",
      "right": 35.5,
      "left": 35,
      "diffAbs": 0.5,
      "diffPct": 1.4,
      "symmetryScore": 99,
      "largerSide": "right",
      "referenceSymmetryPercentile": 85,
      "inwellSymmetryPercentile": 22,
      "progress": {
        "previous": 1.5,
        "current": 1.4,
        "delta": -0.1,
        "direction": "down"
      }
    }
  },
  "progress": {
    "isFirst": false,
    "previousDate": "2026-05-20T09:00:00.000Z",
    "raw": {
      "height": {
        "previous": 178,
        "current": 178,
        "delta": 0,
        "direction": "flat"
      },
      "weight": {
        "previous": 87.9,
        "current": 85.6,
        "delta": -2.3,
        "direction": "down"
      },
      "waist": {
        "previous": 97,
        "current": 93.7,
        "delta": -3.3,
        "direction": "down"
      },
      "hip": {
        "previous": 100.5,
        "current": 98.9,
        "delta": -1.6,
        "direction": "down"
      },
      "chest": {
        "previous": 104.9,
        "current": 106.2,
        "delta": 1.3,
        "direction": "up"
      },
      "neck": {
        "previous": 39.9,
        "current": 39.5,
        "delta": -0.4,
        "direction": "down"
      },
      "bicepsR": {
        "previous": 34.3,
        "current": 35.5,
        "delta": 1.2,
        "direction": "up"
      },
      "bicepsL": {
        "previous": 33.8,
        "current": 35,
        "delta": 1.2,
        "direction": "up"
      },
      "thighR": {
        "previous": 55.8,
        "current": 56.9,
        "delta": 1.1,
        "direction": "up"
      },
      "thighL": {
        "previous": 55.3,
        "current": 56.4,
        "delta": 1.1,
        "direction": "up"
      }
    },
    "metrics": {
      "bmi": {
        "previous": 27.74,
        "current": 27.02,
        "delta": -0.7,
        "direction": "down"
      },
      "whtr": {
        "previous": 0.54,
        "current": 0.53,
        "delta": -0.01,
        "direction": "down"
      },
      "whr": {
        "previous": 0.97,
        "current": 0.95,
        "delta": -0.02,
        "direction": "down"
      },
      "bai": {
        "previous": 24.32,
        "current": 23.65,
        "delta": -0.67,
        "direction": "down"
      },
      "bri": {
        "previous": 4.24,
        "current": 3.87,
        "delta": -0.37,
        "direction": "down"
      },
      "absi": {
        "previous": 0.0793,
        "current": 0.078,
        "delta": -0.0013,
        "direction": "down"
      },
      "ci": {
        "previous": 1.27,
        "current": 1.24,
        "delta": -0.03,
        "direction": "down"
      },
      "avi": {
        "previous": 18.83,
        "current": 17.58,
        "delta": -1.25,
        "direction": "down"
      },
      "vat": {
        "previous": 167.4,
        "current": 142.8,
        "delta": -24.6,
        "direction": "down"
      }
    },
    "bodyFat": {
      "previous": 23.6,
      "current": 21.7,
      "delta": -1.9,
      "direction": "down",
      "isPercentagePoints": true
    },
    "bsa": {
      "previous": 2.06,
      "current": 2.04,
      "delta": -0.02,
      "direction": "down"
    },
    "bmr": {
      "previous": 1915,
      "current": 1883,
      "delta": -32,
      "direction": "down"
    },
    "tdee": {
      "previous": 2968,
      "current": 2919,
      "delta": -49,
      "direction": "down"
    },
    "activity": {
      "previous": "moderate",
      "current": "moderate",
      "changed": false
    }
  },
  "importantInfo": [
    "Ushbu hisobot Inwell xizmati tomonidan siz kiritgan antropometrik oʻlchovlar asosida tayyorlangan va tibbiy tekshiruv, tashxis yoki shifokor xulosasi hisoblanmaydi. Hisobot har qanday kasallik yoki salomatlik holatining mavjudligini tasdiqlamaydi yoki rad etmaydi.",
    "Natijalar noinvaziv antropometrik formulalar yordamida olingan boʻlib, oʻlchov aniqligi, kun vaqti, ovqat va suyuqlik qabul qilish, gidratsiya darajasi va boshqa omillarga qarab sezilarli darajada oʻzgarishi mumkin. Bir martalik oʻlchov vaziyatga bogʻliq bahoni aks ettiradi, organizmning doimiy va aniq xususiyatini emas.",
    "Hisob-kitoblarda ishlatiladigan formulalar va meʼyor oraliqlari (BMI, WHtR, WHR, BAI, BRI, ABSI, konussimonlik indeksi, AVI, visseral yog‘ bahosi va boshqalar) ochiq ilmiy va maʼlumotnoma manbalardan olingan. Bu umumiy qabul qilingan yaqinlashishlar boʻlib, ayrim toifadagi odamlar (sportchilar, keksa yoshdagilar, homilador ayollar va h.k.) uchun xatolik boʻlishi mumkin. Protsentil taqqoslashlar tахминий xarakterga ega va toʻplangan maʼlumotlar hajmiga bogʻliq.",
    "Hisobot shaxsiy tavsiyalarni oʻz ichiga olmaydi va shifokor, dietolog yoki jismoniy reabilitatsiya boʻyicha murabbiy maslahatini almashtirmaydi. Salomatlik holatining aniq manzarasi uchun litsenziyalangan tibbiy muassasaga murojaat qiling.",
    "Inwell ushbu hisobotda taqdim etilgan maʼlumotlar asosida qabul qilingan har qanday qaror, harakat yoki harakatsizlik uchun javobgar emas."
  ],
  "confidentiality": [
    "Sizning maʼlumotlaringiz maxfiy. Inwell oʻlchov natijalarini uchinchi shaxslarga bermaydi, internetda tarqatmaydi. Maʼlumotlar himoyalangan serverda saqlanadi va siz koʻrsatgan telefon raqamiga bogʻlanadi.",
    "Maʼlumotlaringizni oʻchirishni hello@inwell.uz manziliga yozib soʻrashingiz mumkin."
  ]
};
