import { cn } from "@/lib/utils";

export function QordiaLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={cn(className)}
      {...props}
    >
      <path d="M50,10A40,40,0,1,0,90,50,40,40,0,0,0,50,10ZM73,65H65V73H57V65H49V57H57V49H65V57H73Zm-23.5-5.5h-11v-11h11Zm-5.5-17h-11v-11h11Zm17-17h-11v-11h11Zm-17,5.5h-11v-11h11Z"></path>
    </svg>
  );
}
