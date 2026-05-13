# Визуальный эталон: шкала гражданского приёмника 1930-х

Документ фиксирует направление UI для [`FrequencyScale.tsx`](../src/components/FrequencyScale.tsx) и корпуса [`VintageRadioBody.tsx`](../src/components/VintageRadioBody.tsx). В репозиторий **не** копируются чужие фотографии — только ссылки и принципы переноса.

## Референсы (открытые материалы)

- [Wikimedia Commons — Radioskala.jpg](https://commons.wikimedia.org/wiki/File:Radioskala.jpg) — многодиапазонная шкала с подписями городов по полосам.
- [Radiomuseum.org](https://www.radiomuseum.org/) — фотографии лицевых панелей (пример: [Nora W30](https://www.radiomuseum.org/r/nora_w30.html)).
- [AntiqueRadio.org — Kleinempfänger DKE 38](https://antiqueradio.org/KleinempfaengerDKE38.htm), [Volksempfänger VE 301](https://www.antiqueradio.org/VolksempfaengerVE301dyn.htm) — типичная немецкая эстетика 1930-х.

## Что переносим в приложение

- **Циферблат:** кремовый / слоновая кость (`#e8dcc8`), лёгкая тень дуги сверху.
- **Рамка:** тёмный внешний контур, внутренняя кайма «латунь» (`#9a7a48` / `#c4a86a`).
- **Легенда полосы:** капитель, один раз «кГц» в легенде, без суффикса у каждой цифры.
- **Города:** serif, до 2 строк при необходимости; выноска-hairline к шкале.
- **Окно градуировки:** обрамление, равномерные засечки, красные «штифты» станций.
- **Частоты:** табличные цифры по полосам, строго по возрастанию частоты.

## Ограничения проекта

- Одна полоса **MW 520–1600 кГц** (без LW/SW как у многих оригиналов).
- Визуальная близость — через типографику, рамки и выносные линии, а не копию конкретной модели.

## Связанные ТЗ

- [tz-information-field.md](tz-information-field.md)
- [tz-product-policies.md](tz-product-policies.md)
