"use client";

import type { StrategyTool, StrategyToolId } from "@/lib/founder/strategyCenter/types";

type StrategyToolbarProps = {
  tools: StrategyTool[];
  activeToolId: StrategyToolId;
  onSelectTool: (id: StrategyToolId) => void;
};

export function StrategyToolbar({
  tools,
  activeToolId,
  onSelectTool,
}: StrategyToolbarProps) {
  return (
    <div className="strategy-toolbar" role="toolbar" aria-label="Executive thinking tools">
      <p className="strategy-toolbar__label">Executive Tools</p>
      <div className="strategy-toolbar__track">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`strategy-toolbar__tool${
              activeToolId === tool.id ? " strategy-toolbar__tool--active" : ""
            }`}
            onClick={() => onSelectTool(tool.id)}
            title={tool.description}
            aria-pressed={activeToolId === tool.id}
          >
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
}
