"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="bottom-right"
    richColors
    closeButton
    toastOptions={{
      classNames: {
        toast: "rounded-xl! font-medium! text-sm!",
      },
    }}
    {...props}
  />
);

export { Toaster, toast };
