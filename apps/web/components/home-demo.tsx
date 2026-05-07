"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FaRocket } from "react-icons/fa";

import { Button, buttonVariants } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

type DemoForm = {
  name: string;
};

export function HomeDemo() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const { register, handleSubmit, formState } = useForm<DemoForm>({
    defaultValues: { name: "" },
  });

  const demoQuery = useQuery({
    queryKey: ["demo-todo"],
    queryFn: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      if (!res.ok) {
        throw new Error("Demo API failed");
      }
      return res.json() as Promise<{ title: string }>;
    },
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex w-full max-w-lg flex-col gap-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm"
    >
      <div className="flex items-center gap-3">
        <FaRocket className="size-6 text-primary" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold">Stack wired</h2>
          <p className="text-sm text-muted-foreground">
            shadcn/ui · TanStack Query · Zustand · RHF · Motion · Icons
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={toggleSidebar}>
          Toggle shell ({sidebarOpen ? "open" : "closed"})
        </Button>
        <a
          href="https://ui.shadcn.com"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          shadcn docs
        </a>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
        <span className="font-medium text-muted-foreground">TanStack Query (fetch): </span>
        {demoQuery.isLoading && "Loading…"}
        {demoQuery.isError && "Could not load demo."}
        {demoQuery.data?.title}
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit((data) => {
          alert(`Submitted: ${data.name}`);
        })}
      >
        <label className="text-sm font-medium text-foreground">
          React Hook Form
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/50 focus-visible:ring-2"
            placeholder="Your name"
            {...register("name", { required: true, minLength: 2 })}
          />
        </label>
        {formState.errors.name && (
          <p className="text-xs text-destructive">Enter at least 2 characters.</p>
        )}
        <Button type="submit" size="sm" className="self-start">
          Submit
        </Button>
      </form>
    </motion.section>
  );
}
