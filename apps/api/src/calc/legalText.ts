/**
 * Тексты дисклеймера и конфиденциальности — адаптированы из
 * fitaudit/js/report.js (DISCLAIMER_HTML / CONFIDENTIALITY_HTML) под
 * консьюмерский сценарий (нет "компании-заказчика", нет смарт-весов/
 * калипера в списке методов, данные хранятся на сервере, а не локально).
 * Возвращаются как массив абзацев (plain text) — форматирование делает
 * фронтенд.
 */
export const IMPORTANT_INFO_RU: string[] = [
  'Этот отчёт подготовлен сервисом Inwell на основе антропометрических замеров, которые вы указали сами, и не является медицинским исследованием, диагнозом или врачебным заключением. Отчёт не подтверждает и не опровергает наличие каких-либо заболеваний или состояний здоровья.',
  'Результаты получены неинвазивными антропометрическими формулами и могут заметно колебаться в зависимости от точности измерения, времени суток, приёма пищи и жидкости, уровня гидратации и других факторов. Разовый замер отражает ситуативную оценку, а не точную и постоянную характеристику организма.',
  'Формулы и диапазоны норм, используемые в расчётах (BMI, WHtR, WHR, BAI, BRI, ABSI, индекс конусности, AVI, оценка висцерального жира и др.), взяты из открытых научных и справочных источников. Это общепринятые приближения, которые могут содержать погрешность для отдельных категорий людей (спортсмены, пожилые люди, беременные и т.д.). Процентильные сравнения носят ориентировочный характер и зависят от объёма накопленных данных.',
  'Отчёт не содержит персональных рекомендаций и не заменяет консультацию врача, диетолога или тренера ЛФК. Для точной картины состояния здоровья обратитесь в лицензированное медицинское учреждение.',
  'Inwell не несёт ответственности за любые решения, действия или бездействие, предпринятые на основании данных, представленных в этом отчёте.',
];

export const CONFIDENTIALITY_RU: string[] = [
  'Ваши данные конфиденциальны. Inwell не публикует и не передаёт результаты замеров третьим лицам, не рассылает отчёты в интернете. Данные хранятся на защищённом сервере и привязаны к номеру телефона, который вы указали.',
  'Вы можете запросить удаление своих данных, написав на hello@inwell.uz.',
];

export const IMPORTANT_INFO_UZ: string[] = [
  'Ushbu hisobot Inwell xizmati tomonidan siz kiritgan antropometrik oʻlchovlar asosida tayyorlangan va tibbiy tekshiruv, tashxis yoki shifokor xulosasi hisoblanmaydi. Hisobot har qanday kasallik yoki salomatlik holatining mavjudligini tasdiqlamaydi yoki rad etmaydi.',
  'Natijalar noinvaziv antropometrik formulalar yordamida olingan boʻlib, oʻlchov aniqligi, kun vaqti, ovqat va suyuqlik qabul qilish, gidratsiya darajasi va boshqa omillarga qarab sezilarli darajada oʻzgarishi mumkin. Bir martalik oʻlchov vaziyatga bogʻliq bahoni aks ettiradi, organizmning doimiy va aniq xususiyatini emas.',
  'Hisob-kitoblarda ishlatiladigan formulalar va meʼyor oraliqlari (BMI, WHtR, WHR, BAI, BRI, ABSI, konussimonlik indeksi, AVI, visseral yog‘ bahosi va boshqalar) ochiq ilmiy va maʼlumotnoma manbalardan olingan. Bu umumiy qabul qilingan yaqinlashishlar boʻlib, ayrim toifadagi odamlar (sportchilar, keksa yoshdagilar, homilador ayollar va h.k.) uchun xatolik boʻlishi mumkin. Protsentil taqqoslashlar tахминий xarakterga ega va toʻplangan maʼlumotlar hajmiga bogʻliq.',
  'Hisobot shaxsiy tavsiyalarni oʻz ichiga olmaydi va shifokor, dietolog yoki jismoniy reabilitatsiya boʻyicha murabbiy maslahatini almashtirmaydi. Salomatlik holatining aniq manzarasi uchun litsenziyalangan tibbiy muassasaga murojaat qiling.',
  'Inwell ushbu hisobotda taqdim etilgan maʼlumotlar asosida qabul qilingan har qanday qaror, harakat yoki harakatsizlik uchun javobgar emas.',
];

export const CONFIDENTIALITY_UZ: string[] = [
  'Sizning maʼlumotlaringiz maxfiy. Inwell oʻlchov natijalarini uchinchi shaxslarga bermaydi, internetda tarqatmaydi. Maʼlumotlar himoyalangan serverda saqlanadi va siz koʻrsatgan telefon raqamiga bogʻlanadi.',
  'Maʼlumotlaringizni oʻchirishni hello@inwell.uz manziliga yozib soʻrashingiz mumkin.',
];
