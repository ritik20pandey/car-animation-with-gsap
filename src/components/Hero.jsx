import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import mclaren from "../assets/mclaren.png";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_LENGTH = 4;
const CAR_VISIBLE_AT_END = 0.3;
const TRAIL_OFFSET = 0.17;
const CARD_FROM_OPACITY = 0;
const FADE = 0.1;
const CARDS_EARLY_BY = FADE;

const STATS = [
  {
    value: "58%",
    label: "Increase in pick up point use",
    bg: "#dcf44f",
    fg: "#111111",
    pos: "left-[49.1vw] top-[7vh]",
    num: "text-[4.4vw]",
    lab: "text-[1.18vw]",
    group: 0,
    from: -40,
  },
  {
    value: "23%",
    label: "Decreased in customer phone calls",
    bg: "#6cc8ff",
    fg: "#111111",
    pos: "left-[42.7vw] bottom-[7vh]",
    num: "text-[4.1vw]",
    lab: "text-[1.05vw]",
    group: 1,
    from: 40,
  },
  {
    value: "27%",
    label: "Increase in pick up point use",
    bg: "#333333",
    fg: "#ffffff",
    pos: "left-[70.6vw] top-[7vh]",
    num: "text-[4.1vw]",
    lab: "text-[1.05vw]",
    group: 2,
    from: -40,
  },
  {
    value: "40%",
    label: "Decreased in customer phone calls",
    bg: "#fa7327",
    fg: "#111111",
    pos: "left-[65vw] bottom-[7vh]",
    num: "text-[4.1vw]",
    lab: "text-[1.05vw]",
    group: 3,
    from: 40,
  },
];

const GROUPS = Math.max(...STATS.map((s) => s.group)) + 1;

const Hero = () => {
  const heroRef = useRef(null);
  const carRef = useRef(null);
  const trailRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    let ctx;
    let resizeTimer;

    const build = () => {
      ctx?.revert();

      ctx = gsap.context(() => {
        const hero = heroRef.current;
        const car = carRef.current;
        const trail = trailRef.current;
        const cards = cardsRef.current;

        const screenW = hero.clientWidth;
        const carW = car.offsetWidth;

        // Car starts at the left edge and drives out until only 30% of it is visible
        const startX = 0;
        const endX = screenW - carW * CAR_VISIBLE_AT_END;
        const trailShift = carW * TRAIL_OFFSET;

        // clip-path that shows the green trail (and the headline) up to the car
        const clipAt = (x) =>
          `inset(0px ${Math.max(screenW - (x + trailShift), 0)}px 0px 0px)`;

        // Timeline progress (0 to 1) when the car's center reaches the screen center
        const centerProgress = Math.min(
          Math.max((screenW / 2 - carW / 2 - startX) / (endX - startX), 0),
          0.6,
        );

        // Progress when the car's nose touches the right edge: all cards are full before this
        const noseAtEdge = (screenW - carW - startX) / (endX - startX);
        const cardsDoneBy = noseAtEdge - 0.02;

        const firstStart = Math.max(centerProgress - CARDS_EARLY_BY, 0);
        const spacing =
          GROUPS > 1
            ? Math.max(
                Math.min(
                  FADE,
                  (cardsDoneBy - FADE - firstStart) / (GROUPS - 1),
                ),
                0.02,
              )
            : 0;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: () => `+=${window.innerHeight * SCROLL_LENGTH}`,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1) Car drives across the screen and leaves 30% visible
        tl.fromTo(
          car,
          { x: startX },
          { x: endX, duration: 1, force3D: true },
          0,
        );

        // 2) Green trail + headline are revealed behind the car (same speed)
        tl.fromTo(
          trail,
          { clipPath: clipAt(startX) },
          { clipPath: clipAt(endX), duration: 1 },
          0,
        );

        // 3) Upper + lower cards come out together: faint to full
        cards.forEach((el, i) => {
          const s = STATS[i];
          tl.fromTo(
            el,
            { y: s.from, opacity: CARD_FROM_OPACITY, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: FADE,
              ease: "power2.out",
            },
            firstStart + s.group * spacing,
          );
        });
      }, heroRef);
    };

    build();

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden bg-[#d0d0d0]"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Road: dark band in the middle, height follows the car image */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[#212121]">
        {/* Green trail with the headline, revealed by the car */}
        <div
          ref={trailRef}
          className="absolute inset-0 bg-[#45db7c]"
          style={{ clipPath: "inset(0px 100% 0px 0px)" }}
        >
          <h1 className="flex h-full select-none items-center whitespace-nowrap pl-[4.6vw] text-[8.7vw] font-bold leading-none text-[#111111]">
            WELCOME ITZFIZZ
          </h1>
        </div>

        {/* Car (on top of the text) */}
        <img
          ref={carRef}
          src={mclaren}
          alt="Orange McLaren"
          draggable={false}
          className="pointer-events-none relative z-10 block h-auto w-[27.3vw] max-w-none select-none will-change-transform"
        />
      </div>

      {/* Stat cards: two above the road, two below */}
      {STATS.map((s, i) => (
        <div
          key={s.value}
          ref={(el) => {
            cardsRef.current[i] = el;
          }}
          className={`absolute z-20 w-max rounded-2xl p-[2vw] ${s.pos}`}
          style={{ backgroundColor: s.bg, color: s.fg }}
        >
          <h2 className={`${s.num} font-bold leading-none`}>{s.value}</h2>
          <p className={`${s.lab} mt-[0.4vw] leading-tight`}>{s.label}</p>
        </div>
      ))}
    </section>
  );
};

export default Hero;
