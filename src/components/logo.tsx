import { cn } from "@/lib/utils";

export function QordiaLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="M50 90C27.9086 90 10 72.0914 10 50C10 27.9086 27.9086 10 50 10C72.0914 10 90 27.9086 90 50" />
      <path d="M50 90C66.5685 90 80 76.5685 80 60C80 43.4315 66.5685 30 50 30" />
      <path d="M35 35h15v15H35z" fill="currentColor" stroke="none" />
      <path d="M35 55h15" />
      <path d="M55 35h10" />
      <path d="M55 45h10v10H55z" fill="currentColor" stroke="none" />
    </svg>
  );
}
