import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, Children, ReactNode, CSSProperties } from "react";

// --- Types ---
interface CardProps {
  title: string;
  content: string;
}

interface CardContainerProps {
  active: number;
  index: number;
  children: ReactNode;
}

interface CarouselProps {
  children: ReactNode;
}

// --- Constants ---
const MAX_VISIBILITY = 3;

// --- Sub-Component: Card ---
export const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <article
      className="w-full h-full p-8 rounded-2xl text-justify transition-all duration-300 ease-out shadow-xl"
      style={{
        // Dynamic background color based on position (handled by CSS variable from parent)
        backgroundColor: `hsl(280deg, 40%, calc(100% - var(--abs-offset) * 50%))`,
        color: "rgba(0,0,0,0.7)",
      }}
    >
      <h2
        className="text-black m-0 mb-[0.7em] text-center text-2xl font-bold transition-all duration-300 ease-out"
        style={{ opacity: "var(--active)" }}
      >
        {title}
      </h2>
      <p
        className="overflow-hidden text-ellipsis whitespace-pre-wrap line-clamp-[11] transition-all duration-300 ease-out"
        style={{ opacity: "var(--active)" }}
      >
        {content}
      </p>
    </article>
  );
};

// --- Sub-Component: CardContainer ---
const CardContainer: React.FC<CardContainerProps> = ({ active, index, children }) => {
  const offset = (active - index) / 3;
  const direction = Math.sign(active - index);
  const absOffset = Math.abs(active - index) / 3;
  const isActive = index === active;

  return (
    <div
      className="absolute w-full h-full transition-all duration-300 ease-out"
      style={{
        "--active": isActive ? 1 : 0,
        "--offset": offset,
        "--direction": direction,
        "--abs-offset": absOffset,
        pointerEvents: isActive ? "auto" : "none",
        opacity: Math.abs(active - index) >= MAX_VISIBILITY ? 0 : 1,
        display: Math.abs(active - index) > MAX_VISIBILITY ? "none" : "block",
        filter: `blur(calc(${absOffset} * 1rem))`,
        transform: `
            rotateY(calc(${offset} * 50deg))
            scaleY(calc(1 + ${absOffset} * -0.4))
            translateZ(calc(${absOffset} * -30rem))
            translateX(calc(${direction} * -5rem))
          `,
      } as CSSProperties}
    >
      {children}
    </div>
  );
};

// --- Main Component: Carousel ---
export const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const onPrev = () => setActive((i) => i - 1);
  const onNext = () => setActive((i) => i + 1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div 
        className="relative w-[23rem] h-[23rem]" 
        style={{ perspective: "500px", transformStyle: "preserve-3d" }}
      >
        {/* Navigation: Left */}
        {active > 0 && (
          <button
            onClick={onPrev}
            className="absolute z-20 top-1/2 left-0 -translate-x-full -translate-y-1/2 bg-transparent border-none text-white text-[5rem] cursor-pointer select-none hover:text-purple-400 transition-colors"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Card Mapping */}
        {Children.map(children, (child, i) => (
          <CardContainer active={active} index={i}>
            {child}
          </CardContainer>
        ))}

        {/* Navigation: Right */}
        {active < count - 1 && (
          <button
            onClick={onNext}
            className="absolute z-20 top-1/2 right-0 translate-x-full -translate-y-1/2 bg-transparent border-none text-white text-[5rem] cursor-pointer select-none hover:text-purple-400 transition-colors"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Usage Example ---
/*
export default function App() {
  return (
    <Carousel>
      <Card title="Card 1" content="Lorem ipsum dolor sit amet..." />
      <Card title="Card 2" content="Consectetur adipiscing elit..." />
      <Card title="Card 3" content="Sed do eiusmod tempor..." />
      <Card title="Card 4" content="Ut labore et dolore magna..." />
      <Card title="Card 5" content="Exercitation ullamco laboris..." />
    </Carousel>
  );
}
*/