type LegacyWheelEmbedProps = {
  title: string;
  description: string;
};

export function LegacyWheelEmbed({ title, description }: LegacyWheelEmbedProps) {
  const legacyWheelUrl = process.env.NEXT_PUBLIC_LEGACY_WHEEL_URL;

  if (legacyWheelUrl) {
    return (
      <iframe
        src={legacyWheelUrl}
        title={title}
        className="h-[320px] w-full rounded-3xl border border-border bg-white lg:h-[420px]"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-[320px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-primary/40 bg-muted/30 p-6 text-center lg:h-[420px]">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

