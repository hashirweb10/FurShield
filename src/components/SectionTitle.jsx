import React from "react";

export default function SectionTitle({ eyebrow, title, children, dark = false }) {
  return (
    <div className={"section-title " + (dark ? "on-dark" : "")}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
