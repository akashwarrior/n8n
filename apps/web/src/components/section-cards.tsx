import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CardActionWrapper = ({
  title,
  timeline,
  result,
}: {
  title: string;
  timeline: string;
  result?: string;
}) => (
  <Card
    className={cn(
      "shrink-0 grow-0 basis-1/2 sm:basis-1/3 md:flex-1",
      "first:rounded-r-none not-first:not-last:rounded-none last:rounded-l-none",
      "not-first:border-l-0",
    )}
  >
    <CardHeader>
      <CardDescription className="overflow-hidden">
        <p className="text-primary font-semibold truncate text-xs md:text-sm">
          {title}
        </p>
        <p className="text-xs md:text-sm">{timeline}</p>
      </CardDescription>
      <CardTitle
        className={cn(
          "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          !result && "text-muted-foreground",
        )}
      >
        {result || "--"}
      </CardTitle>
    </CardHeader>
  </Card>
);

const FIXED_TIMELINE = "Last 7 days";

export function SectionCards() {
  return (
    <div className="flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden">
      <CardActionWrapper
        title="Prod. executions"
        timeline={FIXED_TIMELINE}
        result="0"
      />

      <CardActionWrapper
        title="Failed Prod. executions"
        timeline={FIXED_TIMELINE}
        result="0"
      />

      <CardActionWrapper
        title="Failure rate"
        timeline={FIXED_TIMELINE}
        result="0%"
      />

      <CardActionWrapper title="Time saved" timeline={FIXED_TIMELINE} />

      <CardActionWrapper
        title="Run time (avg.)"
        timeline={FIXED_TIMELINE}
        result="0s"
      />
    </div>
  );
}
