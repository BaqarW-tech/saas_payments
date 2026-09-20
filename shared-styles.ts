// Email clients strip <style> tags — inline objects are the only reliable
// way to style across Gmail, Outlook, Apple Mail, etc.
export const colors = {
  primary: "#2563eb",
  background: "#f8fafc",
  foreground: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  success: "#16a34a",
  successLight: "#f0fdf4",
  danger: "#dc2626",
};

export const main = { backgroundColor: colors.background, fontFamily: "sans-serif" };
export const container = {
  backgroundColor: colors.card,
  margin: "0 auto",
  padding: "32px",
  maxWidth: "480px",
  borderRadius: "8px",
};
export const header = { marginBottom: "16px" };
export const logoText = { fontSize: "18px", fontWeight: "bold", color: colors.foreground };
export const divider = { borderColor: colors.border, margin: "20px 0" };
export const h1 = { fontSize: "22px", color: colors.foreground };
export const text = { fontSize: "15px", color: colors.foreground, lineHeight: "1.6" };
export const textSmall = { fontSize: "13px", color: colors.muted, lineHeight: "1.5" };
export const footer = { fontSize: "12px", color: colors.muted, lineHeight: "1.5" };
export const link = { color: colors.primary };
export const buttonContainer = { margin: "24px 0", textAlign: "center" as const };
export const button = {
  backgroundColor: colors.primary,
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "15px",
  textDecoration: "none",
};
export const detailsBox = {
  backgroundColor: colors.background,
  padding: "16px",
  borderRadius: "6px",
  margin: "16px 0",
};
export const detailsTitle = { fontSize: "13px", fontWeight: "bold", color: colors.muted, marginBottom: "8px" };
export const detailRow = { display: "flex" as const, justifyContent: "space-between" as const };
export const detailLabel = { fontSize: "14px", color: colors.muted };
export const detailValue = { fontSize: "14px", color: colors.foreground, fontWeight: "bold" };
