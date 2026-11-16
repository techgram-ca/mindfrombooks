"use client";
import { useState } from "react";
import { saveSupportNoteAction } from "@/app/admin/actions";
import { useSave } from "@/components/admin/use-save";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

/** Private note on a support message (only admins see it). */
export function SupportNote({ id, note }: { id: string; note: string | null }) {
  const { pending, save } = useSave();
  const [value, setValue] = useState(note ?? "");
  const dirty = value !== (note ?? "");
  return (
    <div className="space-y-2">
      <Textarea
        aria-label="Private note"
        rows={2}
        className="min-h-0 text-sm"
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Private note (only admins see this), e.g. refunded manually on 18 Nov"
      />
      {dirty && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => save(() => saveSupportNoteAction(id, value))}
        >
          {pending ? "Saving…" : "Save note"}
        </Button>
      )}
    </div>
  );
}
