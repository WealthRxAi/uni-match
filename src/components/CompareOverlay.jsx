function formatUSD(amount) {
  if (typeof amount !== "number") return "—";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

const ROWS = [
  { key: "gpa", label: "GPA needed", render: (u) => (typeof u.minGPA === "number" ? u.minGPA.toFixed(2) : "—") },
  { key: "label", label: "Label", render: (u, extra) => extra.label || "—" },
  { key: "tuition", label: "Tuition/yr", render: (u) => formatUSD(u.tuitionIntlUSD) },
  { key: "total", label: "Total/yr", render: (u) => formatUSD(u.tuitionIntlUSD + u.livingCostUSD) },
  { key: "gradRate", label: "Grad rate", render: (u) => formatPercent(u.gradRate) },
  { key: "earnings", label: "Median earnings (10yr)", render: (u) => formatUSD(u.medianEarnings10yr) },
  { key: "debt", label: "Median debt", render: (u) => formatUSD(u.medianDebt) },
  {
    key: "programEarnings",
    label: "Program earnings (5yr)",
    render: (u, extra) => (extra.program ? formatUSD(extra.program.medianEarnings5yr) : "—"),
  },
];

function CompareOverlay({ open, onClose, universities, loading, error, matchById, programsById, onRemove }) {
  if (!open) return null;

  return (
    <div className="compare-overlay-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="compare-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="compare-overlay__header">
          <h2 id="compare-heading" className="section-title">
            Compare universities
          </h2>
          <button type="button" className="compare-overlay__close" onClick={onClose} aria-label="Close compare">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="empty-state" aria-live="polite" aria-busy="true">
            <div className="spinner" role="status" aria-label="Loading comparison" />
            <p className="empty-state__body">Loading comparison…</p>
          </div>
        ) : error ? (
          <p className="empty-state__body">{error}</p>
        ) : universities.length === 0 ? (
          <p className="empty-state__body">
            Add up to 4 schools to compare using the + button on any result card.
          </p>
        ) : (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">School</th>
                  {universities.map((u) => (
                    <th key={u.id} scope="col">
                      <div className="compare-table__school">
                        <span>{u.name}</span>
                        <button
                          type="button"
                          className="compare-table__remove"
                          onClick={() => onRemove(u.id)}
                          aria-label={`Remove ${u.name} from compare`}
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {universities.map((u) => (
                      <td key={u.id}>
                        {row.render(u, {
                          label: matchById?.[u.id]?.label,
                          program: programsById?.[u.id],
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompareOverlay;
