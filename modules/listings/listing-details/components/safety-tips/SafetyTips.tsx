import { Lightbulb, Check, ExternalLink } from 'lucide-react';
import { SAFETY_TIPS } from './constants';

const SafetyTips = () => {
  return (
    <div className="space-y-4 rounded-lg border bg-linear-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-2">
          <Lightbulb className="text-primary size-6" />
        </div>
        <h2 className="text-xl font-semibold">Safety Tips</h2>
      </div>

      {/* Tips List */}
      <ul className="space-y-3">
        {SAFETY_TIPS.map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
            <span className="text-muted-foreground text-sm">{tip}</span>
          </li>
        ))}
      </ul>

      {/* Learn More Button */}
      <button className="text-primary hover:text-primary/80 flex w-full items-center justify-center gap-2 pt-2 text-sm font-medium transition-colors">
        Learn More
        <ExternalLink className="size-4" />
      </button>
    </div>
  );
};

export default SafetyTips;
