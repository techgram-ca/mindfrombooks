"use client";
import { useActionState, useState } from "react";
import {
  deleteAccountAction,
  updateSettingsAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { signOutAction } from "@/app/(auth)/actions";
import { useTimezones } from "@/components/auth/auth-forms";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldHint, Input, Label, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Profile } from "@/lib/types";

const initial: ActionState = {};

function hourLabel(h: number): string {
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:00 ${suffix}`;
}

export function SettingsForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateSettingsAction, initial);
  const [deleteState, deleteAction] = useActionState(deleteAccountAction, initial);
  const { all } = useTimezones();
  const zones = all.includes(profile.timezone) ? all : [profile.timezone, ...all];
  const [reminders, setReminders] = useState(profile.email_reminders);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <form action={action} className="space-y-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                required
                maxLength={80}
                autoComplete="name"
              />
              <FieldHint>Shown on your certificates.</FieldHint>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled readOnly />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select id="timezone" name="timezone" defaultValue={profile.timezone}>
                {zones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
              <FieldHint>
                Used for reminders and for courses you start from now on. Courses already running
                keep the timezone they started with.
              </FieldHint>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="email_reminders" className="mb-0">
                  Daily email reminders
                </Label>
                <FieldHint className="mt-0.5">
                  One email a day, only when you have a task waiting.
                </FieldHint>
              </div>
              <Switch
                id="email_reminders"
                name="email_reminders"
                checked={reminders}
                onCheckedChange={setReminders}
              />
            </div>
            <div>
              <Label htmlFor="reminder_hour">Reminder time</Label>
              <Select
                id="reminder_hour"
                name="reminder_hour"
                defaultValue={String(profile.reminder_hour)}
                disabled={!reminders}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </Select>
              {!reminders && (
                <input type="hidden" name="reminder_hour" value={profile.reminder_hour} />
              )}
            </div>
            {state.error && (
              <p
                role="alert"
                className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm"
              >
                {state.error}
              </p>
            )}
            {state.message && (
              <p
                role="status"
                className="bg-success-soft text-success rounded-xl px-3.5 py-2.5 text-sm"
              >
                {state.message}
              </p>
            )}
            <SubmitButton pendingText="Saving…">Save settings</SubmitButton>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-base font-semibold tracking-normal">Log out</h2>
            <p className="text-muted-foreground text-sm">On this device.</p>
          </div>
          <form action={signOutAction}>
            <Button variant="outline" type="submit">
              Log out
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="border-danger/30">
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-base font-semibold tracking-normal">Delete account</h2>
            <p className="text-muted-foreground text-sm">
              Removes your profile, courses and everything you wrote.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-danger/40 text-danger">
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This permanently deletes your profile, your course progress and all your responses.
                It can&apos;t be undone, and any refund guarantee still open is given up.
              </DialogDescription>
              <form action={deleteAction} className="mt-5 space-y-3">
                <Label htmlFor="confirm">Type DELETE to confirm</Label>
                <Input id="confirm" name="confirm" autoComplete="off" autoCapitalize="characters" />
                {deleteState.error && (
                  <p role="alert" className="text-danger text-sm">
                    {deleteState.error}
                  </p>
                )}
                <SubmitButton variant="danger" className="w-full" pendingText="Deleting…">
                  Delete my account
                </SubmitButton>
              </form>
            </DialogContent>
          </Dialog>
        </CardBody>
      </Card>
    </div>
  );
}
