type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] !text-[#7c6cf2]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight !text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 !text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

