import React from 'react';
import { Flag } from 'lucide-react';

export default async function ReportDisplayPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center">
      <div className="bg-muted mb-6 rounded-full p-6">
        <Flag className="text-muted-foreground/50 h-12 w-12" />
      </div>
      <h3 className="text-xl font-bold">Content Moderation</h3>
      <p className="text-muted-foreground mt-2">
        Select a report from the queue to review details.
      </p>
    </div>
  );
}
