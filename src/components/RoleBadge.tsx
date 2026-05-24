/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface RoleBadgeProps {
  role: string;
}

const roleStyles: Record<string, string> = {
  "Batter":      "bg-[#3e495d]/30 text-[#bcc7de] border-[#bcc7de]/20",
  "Bowler":      "bg-[#82d2ff]/10 text-[#82d2ff] border-[#82d2ff]/20",
  "All-Rounder": "bg-[#273647]/50 text-[#d4e4fa] border-[#3b4a3d]",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const normalizedRole = role.toLowerCase().includes("bat")
    ? "Batter"
    : role.toLowerCase().includes("bowl")
      ? "Bowler"
      : "All-Rounder";

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border font-medium ${
        roleStyles[normalizedRole] ?? roleStyles["All-Rounder"]
      }`}
    >
      {normalizedRole}
    </span>
  );
}
