export function StatusBadge({
  kind,
}: {
  kind: 'confirmed' | 'assisted' | 'heuristic'
}) {
  const labels = {
    confirmed: '已核對資料',
    assisted: '例外庫輔助推測',
    heuristic: '規則推測',
  }

  return <span className={`status-badge ${kind}`}>{labels[kind]}</span>
}
