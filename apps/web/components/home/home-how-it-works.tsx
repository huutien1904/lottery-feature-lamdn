type HomeHowItWorksProps = {
  messages: {
    title: string;
    subtitle: string;
    customizeTitle: string;
    customizeDescription: string;
    embedTitle: string;
    embedDescription: string;
    analyzeTitle: string;
    analyzeDescription: string;
  };
};

export function HomeHowItWorks({ messages }: HomeHowItWorksProps) {
  const cards = [
    { title: messages.customizeTitle, description: messages.customizeDescription, step: "01" },
    { title: messages.embedTitle, description: messages.embedDescription, step: "02" },
    { title: messages.analyzeTitle, description: messages.analyzeDescription, step: "03" },
  ];

  return (
    <section id="features" className="bg-muted/30 py-14 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{messages.title}</h2>
          <p className="mt-3 text-muted-foreground">{messages.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.step} className="rounded-2xl border border-border bg-card p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                {card.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

