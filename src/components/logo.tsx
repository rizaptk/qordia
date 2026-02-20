import { cn } from "@/lib/utils";

export function QordiaLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={cn(className)}
      {...props}
    >
      <path
        d="M50,10A40,40,0,1,0,90,50,40,40,0,0,0,50,10ZM50,82A32,32,0,1,1,82,50,32,32,0,0,1,50,82Z"
        opacity="0.3"
      />
      <path d="M43,35h14v14H43V35Zm7-18a2,2,0,0,0-2,2V28H39a2,2,0,0,0-2,2v22a2,2,0,0,0,2,2H48v9a2,2,0,0,0,4,0V54h9a2,2,0,0,0,2-2V30a2,2,0,0,0-2-2H52V19a2,2,0,0,0-2-2Zm7,30H41V32h8v7a2,2,0,0,0,4,0V32h6V50Z" />
      <path d="M70,64a6,6,0,1,0,6,6A6,6,0,0,0,70,64Zm0,8a2,2,0,1,1,2-2A2,2,0,0,1,70,72Z" />
    </svg>
  );
}
