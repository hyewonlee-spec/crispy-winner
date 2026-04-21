# Phase 5 UX Patch

Changes made from iPhone 17 Pro Max feedback:

- Date input width reduced on Today screen.
- Readiness card changes colour by zone: Green / Amber / Red.
- Slider thumb is larger and darker for mobile visibility.
- Small acknowledgement pulse added to buttons and range inputs.
- Save Template renamed to Save as Notion template and explained.
- Library tab has an Add custom exercise to library button.
- Progress bar charts changed to line charts.
- Weekly and monthly overview cards added to Progress.
- Rules tab renamed to Check.
- Check tab now includes food choice, sleep hygiene, mobility/stretching, and modify-today prompts.
- Lavender UI retained and adjusted for large iPhones and smaller screens.

## Period tracker ideas

Best implementation path:

1. Start simple with one new Notion database: Cycle Logs.
2. Add a new app tab or a section inside Check called Cycle.
3. Track:
   - Period start date
   - Period end date
   - Cycle day auto-calculation
   - Flow: none / light / medium / heavy
   - Cramps: 0–10
   - Mood: calm / irritable / anxious / low / good
   - Sleep disruption: 0–10
   - Energy: 0–10
   - Appetite/cravings
   - Training adjustment: normal / reduce load / rehab only
   - Notes

Suggested Notion database:

Cycle Logs

| Property | Type |
|---|---|
| Cycle Log | Title |
| Date | Date |
| Period Day | Number |
| Flow | Select |
| Cramps | Number |
| Mood | Select |
| Energy | Number |
| Sleep Disruption | Number |
| Cravings/Appetite | Select |
| Training Adjustment | Select |
| Notes | Text |
