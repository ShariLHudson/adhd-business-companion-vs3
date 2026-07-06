"use client";

import type { ResourceDepartment } from "@/lib/executiveResourcesCenter/types/resources";

import { ResourceItemCard } from "./ResourceItemCard";

type ResourceDepartmentPanelProps = {
  department: ResourceDepartment;
  defaultOpen?: boolean;
};

export function ResourceDepartmentPanel({
  department,
  defaultOpen = false,
}: ResourceDepartmentPanelProps) {
  return (
    <details className="founder-resource__department" open={defaultOpen}>
      <summary className="founder-resource__department-summary">
        <span className="founder-resource__department-label">{department.label}</span>
        <span className="founder-resource__department-count">
          {department.items.length} resources
        </span>
      </summary>
      <p className="founder-resource__department-purpose">{department.purpose}</p>
      <div className="founder-resource__grid">
        {department.items.map((item) => (
          <ResourceItemCard key={item.id} item={item} />
        ))}
      </div>
    </details>
  );
}
