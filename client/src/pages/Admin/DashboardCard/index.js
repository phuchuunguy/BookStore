import styles from "./DashboardCard.module.css";

const accentMap = {
  emerald: {
    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    border: "#6ee7b7",
    iconBg: "rgba(16, 185, 129, 0.15)",
    iconColor: "#047857",
  },
  sapphire: {
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#93c5fd",
    iconBg: "rgba(37, 99, 235, 0.15)",
    iconColor: "#1d4ed8",
  },
  amber: {
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    border: "#fbbf24",
    iconBg: "rgba(245, 158, 11, 0.15)",
    iconColor: "#b45309",
  },
  rose: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecdd3 100%)",
    border: "#fb7185",
    iconBg: "rgba(244, 63, 94, 0.15)",
    iconColor: "#be123c",
  },
  violet: {
    background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    border: "#c4b5fd",
    iconBg: "rgba(139, 92, 246, 0.15)",
    iconColor: "#6d28d9",
  },
};

const DashboardCard = ({
  name,
  title,
  quantity,
  value,
  subtitle,
  Icon,
  accent = "sapphire",
  trendLabel,
  trendValue,
  trendDirection = "neutral",
  footer,
}) => {
  const theme = accentMap[accent] || accentMap.sapphire;
  const displayTitle = title || name || "—";
  const displayValue =
    value !== undefined && value !== null
      ? value
      : quantity !== undefined && quantity !== null
      ? quantity
      : "—";

  return (
    <div
      className={styles.dashboardCard}
      style={{ background: theme.background, borderColor: theme.border }}
    >
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.title}>{displayTitle}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
        {Icon && (
          <div
            className={styles.icon}
            style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
          >
            <Icon />
          </div>
        )}
      </div>
      <p className={styles.value}>{displayValue}</p>
      {(trendLabel || trendValue) && (
        <div className={styles.trendRow}>
          {trendValue && (
            <span className={`${styles.badge} ${styles[trendDirection] || ""}`}>
              {trendValue}
            </span>
          )}
          {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
        </div>
      )}
      <p className={styles.footer}>{footer || "\u00A0"}</p>
    </div>
  );
};

export default DashboardCard;
