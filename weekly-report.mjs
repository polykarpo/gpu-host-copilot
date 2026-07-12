import { calculateHostingProfit } from "./calculator.mjs";

const FIELDS = [
  "observationDays", "grossRevenue", "averagePowerW", "electricityPricePerKwh",
  "runningHours", "findingHours", "idleHours",
];
const NUMBER_ERROR = "0 이상의 유한한 숫자를 입력해 주세요.";
const decisions = {
  "collect-more-data": {
    title: "판단보다 기록 범위를 먼저 채우세요.",
    copy: "관찰 범위가 90% 미만입니다. 빠진 시간을 먼저 기록한 뒤 다시 판단하세요.",
  },
  "recheck-costs": {
    title: "측정 전력 기준으로는 손실입니다.",
    copy: "측정한 작업 전력 기준 순손실입니다. 전력 단가와 전체 시스템 전력을 다시 확인하세요.",
  },
  "observe-availability-gap": {
    title: "순이익은 남았지만, FINDING 구간을 더 관찰하세요.",
    copy: "FINDING은 설정, 자격 조건, 네트워크, 업데이트, 제공업체 수요 등 여러 원인이 있을 수 있으며 제공업체 수요의 증거가 아닙니다. 자동 제어하지 말고 발생 시간대를 더 관찰하세요.",
  },
  "review-thin-margin": {
    title: "순이익은 남았지만, 마진 여유가 작습니다.",
    copy: "순이익은 양수지만 마진이 20% 미만입니다. 제외 비용까지 반영해 여유를 다시 확인하세요.",
  },
  "maintain-observation": {
    title: "현재 조건에서는 관찰을 유지할 수 있습니다.",
    copy: "현재 측정 조건에서는 순이익과 관찰 범위가 양호합니다. 보장된 결과로 보지 말고 같은 방식으로 관찰을 유지하세요.",
  },
};

export function buildWeeklyReport(input) {
  const errors = Object.fromEntries(FIELDS
    .filter((field) => !Number.isFinite(input[field]) || input[field] < 0)
    .map((field) => [field, NUMBER_ERROR]));
  if (!errors.observationDays && input.observationDays === 0) errors.observationDays = "0보다 큰 값을 입력해 주세요.";
  if (Object.keys(errors).length) return { errors };

  const totalHours = input.observationDays * 24;
  const observedHours = input.runningHours + input.findingHours + input.idleHours;
  if (observedHours > totalHours) return { errors: { stateHours: "상태 시간 합계는 전체 관찰 가능 시간을 넘을 수 없습니다." } };

  const unobservedHours = totalHours - observedHours;
  const profit = calculateHostingProfit({
    observationDays: input.observationDays,
    grossRevenue: input.grossRevenue,
    averagePowerW: input.averagePowerW,
    workloadHoursPerDay: input.runningHours / input.observationDays,
    electricityPricePerKwh: input.electricityPricePerKwh,
  });
  const percentage = (hours) => hours / totalHours * 100;
  const coveragePct = percentage(observedHours);
  const findingPct = percentage(input.findingHours);
  const decision = coveragePct < 90 ? "collect-more-data"
    : profit.netProfit < 0 ? "recheck-costs"
      : findingPct >= 25 ? "observe-availability-gap"
        : profit.marginPct < 20 ? "review-thin-margin" : "maintain-observation";

  return {
    totalHours,
    hours: { running: input.runningHours, finding: input.findingHours, idle: input.idleHours, unobserved: unobservedHours },
    percentages: { running: percentage(input.runningHours), finding: findingPct, idle: percentage(input.idleHours), unobserved: percentage(unobservedHours) },
    coveragePct,
    ...profit,
    decision,
    decisionTitle: decisions[decision].title,
    decisionCopy: decisions[decision].copy,
    errors: {},
  };
}
