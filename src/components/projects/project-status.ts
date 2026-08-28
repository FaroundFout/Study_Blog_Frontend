export type ProjectStage = "planning" | "ongoing" | "completed" | "archived";

export const PROJECT_STAGES: Array<{
  key: ProjectStage;
  label: string;
  code: string;
}> = [
  { key: "planning", label: "规划", code: "Plan" },
  { key: "ongoing", label: "进行", code: "Build" },
  { key: "completed", label: "完成", code: "Ship" },
  { key: "archived", label: "归档", code: "Archive" }
];

export function normalizeProjectStage(status?: string): ProjectStage {
  if (status === "planning") {
    return "planning";
  }

  if (status === "ongoing" || status === "active") {
    return "ongoing";
  }

  if (status === "completed") {
    return "completed";
  }

  return "archived";
}
