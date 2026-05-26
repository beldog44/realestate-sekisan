import type { PropertyStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const VARIANT_CLASSES = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const variantMap: Record<PropertyStatus, BadgeProps["variant"]> = {
    買付候補: "success",
    詳細確認: "info",
    保留: "warning",
    除外: "danger",
    未設定: "default",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
