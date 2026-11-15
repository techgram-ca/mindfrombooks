import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/card";

export function EmptyState({
  emoji,
  title,
  children,
  action,
}: {
  emoji?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed bg-transparent shadow-none">
      <CardBody className="flex flex-col items-center py-10 text-center">
        {emoji && (
          <div className="mb-3 text-4xl" aria-hidden>
            {emoji}
          </div>
        )}
        <h2 className="text-xl font-semibold">{title}</h2>
        {children && <div className="text-muted-foreground mt-2 max-w-sm">{children}</div>}
        {action && <div className="mt-5">{action}</div>}
      </CardBody>
    </Card>
  );
}
