import { buildWeeklyReport } from "./weekly-report.mjs";

const report = buildWeeklyReport({
  observationDays: 7, grossRevenue: 50000, averagePowerW: 300,
  electricityPricePerKwh: 180, runningHours: 108, findingHours: 44, idleHours: 8,
});
const won = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 });

document.querySelector("#report-headline").textContent = report.decisionTitle;
document.querySelector("#net-profit").textContent = won.format(report.netProfit);
document.querySelector("#energy-cost").textContent = won.format(report.energyCost);
document.querySelector("#coverage").textContent = `${number.format(report.coveragePct)}%`;
document.querySelector("#decision-copy").textContent = report.decisionCopy;
for (const [state, hours] of Object.entries(report.hours)) {
  document.querySelector(`#${state}-hours`).textContent = `${number.format(hours)}시간 · ${number.format(report.percentages[state])}%`;
}
