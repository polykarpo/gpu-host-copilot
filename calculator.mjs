const FIELD_ERROR = "0 이상의 유한한 숫자를 입력해 주세요.";

const fields = [
  "observationDays",
  "grossRevenue",
  "averagePowerW",
  "workloadHoursPerDay",
  "electricityPricePerKwh",
];

export function calculateHostingProfit(input) {
  const errors = Object.fromEntries(
    fields
      .filter((field) => !Number.isFinite(input[field]) || input[field] < 0)
      .map((field) => [field, FIELD_ERROR]),
  );

  if (!errors.observationDays && input.observationDays === 0) {
    errors.observationDays = "1일 이상 입력해 주세요.";
  }
  if (!errors.workloadHoursPerDay && input.workloadHoursPerDay > 24) {
    errors.workloadHoursPerDay = "0~24시간 사이로 입력해 주세요.";
  }

  if (Object.keys(errors).length) return { errors };

  const energyKwh = input.averagePowerW / 1000
    * input.workloadHoursPerDay
    * input.observationDays;
  const energyCost = energyKwh * input.electricityPricePerKwh;
  const netProfit = input.grossRevenue - energyCost;
  const marginPct = input.grossRevenue > 0
    ? netProfit / input.grossRevenue * 100
    : 0;
  const monthly = (value) => input.observationDays > 0
    ? value / input.observationDays * 30
    : 0;

  return {
    energyKwh,
    energyCost,
    netProfit,
    marginPct,
    breakEvenGross: energyCost,
    monthlyNetProfit: monthly(netProfit),
    monthlyGrossRevenue: monthly(input.grossRevenue),
    decision: netProfit < 0 ? "loss" : marginPct < 20 ? "thin" : "positive",
    errors: {},
  };
}
