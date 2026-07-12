import { calculateHostingProfit } from "./calculator.mjs";

const form = document.querySelector("#calculator");
const resultSheet = document.querySelector("#results");
const resultList = resultSheet.querySelector(".result-list");
const resultTitle = document.querySelector("#result-title");
const decisionNote = document.querySelector("#decision-note");

const fields = [
  "observationDays",
  "grossRevenue",
  "averagePowerW",
  "workloadHoursPerDay",
  "electricityPricePerKwh",
];

const decisions = {
  loss: ["전기료를 빼면 손실입니다", "조건을 다시 확인하고 더 긴 기간을 관찰해 보세요. 운영 지속을 권하지 않습니다."],
  thin: ["마진 여유가 거의 없습니다", "순마진이 20% 미만입니다. 변동과 누락 비용을 견딜 여유가 작은 구간입니다."],
  positive: ["전기료를 빼고도 남습니다", "순마진이 20% 이상입니다. 보장된 수익은 아니므로 실제 값을 계속 관찰하세요."],
};

const won = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

function showErrors(errors) {
  for (const field of fields) {
    const input = form.elements[field];
    const message = errors[field] || "";
    input.setAttribute("aria-invalid", String(Boolean(message)));
    document.querySelector(`#${field}-error`).textContent = message;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(fields.map((field) => [field, form.elements[field].valueAsNumber]));
  const result = calculateHostingProfit(values);

  showErrors(result.errors);
  if (Object.keys(result.errors).length) {
    resultTitle.textContent = "입력값을 확인해 주세요";
    decisionNote.textContent = "표시된 항목을 고치면 결과를 계산할 수 있습니다.";
    resultList.hidden = true;
    delete resultSheet.dataset.decision;
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  const [title, note] = decisions[result.decision];
  resultTitle.textContent = title;
  decisionNote.textContent = note;
  resultSheet.dataset.decision = result.decision;
  document.querySelector("#netProfit").textContent = won.format(result.netProfit);
  document.querySelector("#energyCost").textContent = won.format(result.energyCost);
  document.querySelector("#energyKwh").textContent = `${number.format(result.energyKwh)} kWh`;
  document.querySelector("#marginPct").textContent = `${number.format(result.marginPct)}%`;
  document.querySelector("#monthlyNetProfit").textContent = won.format(result.monthlyNetProfit);
  document.querySelector("#breakEvenGross").textContent = won.format(result.breakEvenGross);
  resultList.hidden = false;
});
