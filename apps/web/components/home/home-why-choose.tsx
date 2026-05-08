type HomeWhyChooseProps = {
  messages: {
    title: string;
    mainTitle: string;
    mainDescription: string;
    bulletOne: string;
    bulletTwo: string;
    bulletThree: string;
    effectsTitle: string;
    effectsDescription: string;
    easeTitle: string;
    easeDescription: string;
    mobileTitle: string;
    mobileDescription: string;
  };
};

export function HomeWhyChoose({ messages }: HomeWhyChooseProps) {
  return (
    <section id="showcase" className="bg-background py-14 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {messages.title}
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl bg-[#001b4b] p-6 text-white">
            <h3 className="text-2xl font-semibold">{messages.mainTitle}</h3>
            <p className="mt-3 text-sm text-white/80">{messages.mainDescription}</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>• {messages.bulletOne}</li>
              <li>• {messages.bulletTwo}</li>
              <li>• {messages.bulletThree}</li>
            </ul>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-semibold text-foreground">{messages.effectsTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{messages.effectsDescription}</p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-semibold text-foreground">{messages.easeTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{messages.easeDescription}</p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-foreground">{messages.mobileTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{messages.mobileDescription}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

