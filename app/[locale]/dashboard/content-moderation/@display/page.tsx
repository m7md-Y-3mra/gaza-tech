import React from 'react';
import { Flag } from 'lucide-react';

export default async function ReportDisplayPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <Flag className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-bold">Content Moderation</h3>
      <p className="mt-2 text-muted-foreground">Select a report from the queue to review details.</p>
    </div>
  );
}
