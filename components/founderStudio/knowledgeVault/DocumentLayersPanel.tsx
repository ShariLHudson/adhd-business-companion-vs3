"use client";

import { DOCUMENT_LAYERS, DOCUMENT_LAYER_SUMMARY } from "@/lib/founderKnowledgeVault/documentLayers";

export function DocumentLayersPanel() {
  return (
    <section className="founder-vault__layers" aria-labelledby="vault-layers-title">
      <h2 className="founder-vault__section-title" id="vault-layers-title">
        Three-Layer Architecture
      </h2>
      <p className="founder-vault__lead">{DOCUMENT_LAYER_SUMMARY}</p>
      <div className="founder-vault__layer-flow">
        {DOCUMENT_LAYERS.map((layer, index) => (
          <div key={layer.id} className="founder-vault__layer">
            {index > 0 ? <span className="founder-vault__layer-arrow" aria-hidden="true">↓</span> : null}
            <h3 className="founder-vault__layer-label">{layer.label}</h3>
            <p className="founder-vault__layer-role">{layer.role}</p>
            <p className="founder-vault__layer-desc">{layer.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
