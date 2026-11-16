"use client";
import { useActionState, useState } from "react";
import { sendSupportMessageAction, type ContactState } from "@/app/(marketing)/contact/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/input";
import { SUPPORT_TOPICS } from "@/lib/validators/support";

const initial: ContactState = {};

export function ContactForm({
  name,
  email,
  topic,
}: {
  name?: string;
  email?: string;
  topic?: string;
}) {
  const [state, action] = useActionState(sendSupportMessageAction, initial);
  const [startedAt] = useState(() => Date.now());
  const [length, setLength] = useState(0);

  if (state.sent) {
    return (
      <div role="status" className="text-center">
        <div className="text-4xl" aria-hidden>
          ✉️
        </div>
        <h2 className="mt-3 text-2xl font-semibold">Message sent</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
          Thank you. We usually reply within 1–2 business days, by email. If you don&apos;t see our
          reply, check your spam or junk folder.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Honeypot: hidden from people and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            defaultValue={name}
            autoComplete="name"
            required
            maxLength={80}
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="email"
            required
          />
          <FieldHint>We&apos;ll reply to this address.</FieldHint>
        </div>
      </div>
      <div>
        <Label htmlFor="contact-topic">What is it about?</Label>
        <Select
          id="contact-topic"
          name="topic"
          defaultValue={topic && topic in SUPPORT_TOPICS ? topic : "general"}
        >
          {Object.entries(SUPPORT_TOPICS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={4000}
          onChange={(e) => setLength(e.target.value.length)}
          placeholder="Tell us what's going on. For a course or payment question, include the course name."
        />
        <p className="text-muted-foreground mt-1 text-right text-xs" aria-live="polite">
          {length}/4000
        </p>
      </div>
      {state.error && (
        <p role="alert" className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm">
          {state.error}
        </p>
      )}
      <SubmitButton size="lg" className="w-full sm:w-auto" pendingText="Sending…">
        Send message
      </SubmitButton>
    </form>
  );
}
