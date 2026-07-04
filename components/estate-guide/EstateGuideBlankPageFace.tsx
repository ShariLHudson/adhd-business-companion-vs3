type Props = {
  side: "left" | "right";
};

/** Blank paper on the reverse of a turning leaf — never mirrored text. */
export function EstateGuideBlankPageFace({ side }: Props) {
  return (
    <div
      className={[
        "eg-guide-page",
        "eg-guide-page--blank",
        side === "left" ? "eg-guide-page--left" : "eg-guide-page--right",
      ].join(" ")}
      aria-hidden="true"
    />
  );
}
