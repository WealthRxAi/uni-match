import universities from "../data/universities.json";

export default universities.map((u) => ({
  ...u,
  totalAnnualUSD: u.tuitionIntlUSD + u.livingCostUSD,
}));
