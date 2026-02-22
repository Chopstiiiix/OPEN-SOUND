"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedListProps<T> = {
  items: T[];
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
  className?: string;
  itemClassName?: string;
  renderItem?: (item: T, index: number, isSelected: boolean) => React.ReactNode;
};

export default function AnimatedList<T>({
  items,
  onItemSelect,
  showGradients = false,
  enableArrowNavigation = false,
  displayScrollbar = false,
  className,
  itemClassName,
  renderItem,
}: AnimatedListProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [visibleMap, setVisibleMap] = useState<Record<number, boolean>>({});
  const activeIndex = Math.min(selectedIndex, Math.max(items.length - 1, 0));

  const listId = useId().replace(/:/g, "");

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 2);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }

  useEffect(() => {
    updateScrollState();
  }, [items.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const nodes = Array.from(
      el.querySelectorAll<HTMLElement>("[data-list-index]")
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleMap((prev) => {
          const next = { ...prev };
          let changed = false;

          for (const entry of entries) {
            const raw = entry.target.getAttribute("data-list-index");
            const index = raw ? Number(raw) : -1;
            if (index < 0) continue;
            const inView = entry.intersectionRatio >= 0.45;
            if (next[index] !== inView) {
              next[index] = inView;
              changed = true;
            }
          }

          return changed ? next : prev;
        });
      },
      { root: el, threshold: [0.1, 0.45, 0.8] }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const active = el.querySelector<HTMLElement>(`[data-list-index=\"${activeIndex}\"]`);
    active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  function handleSelect(index: number) {
    setSelectedIndex(index);
    const item = items[index];
    if (item && onItemSelect) onItemSelect(item, index);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!enableArrowNavigation || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(activeIndex);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        id={listId}
        ref={scrollRef}
        tabIndex={enableArrowNavigation ? 0 : -1}
        onKeyDown={onKeyDown}
        onScroll={updateScrollState}
        className={cn(
          "relative max-h-[420px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2 focus:outline-none focus:ring-1 focus:ring-amber-500/30",
          !displayScrollbar && "no-scrollbar"
        )}
        role="listbox"
        aria-activedescendant={`${listId}-item-${activeIndex}`}
      >
        <div className="space-y-1">
          {items.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={`${listId}-${index}`}
                id={`${listId}-item-${index}`}
                data-list-index={index}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full rounded-xl px-2 py-2 text-left transition-all duration-300 cursor-pointer",
                  isSelected ? "bg-amber-500/15" : "hover:bg-white/[0.06]",
                  visibleMap[index]
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2",
                  itemClassName
                )}
                style={{ transitionDelay: `${Math.min(index * 24, 220)}ms` }}
              >
                {renderItem ? renderItem(item, index, isSelected) : String(item)}
              </div>
            );
          })}
        </div>
      </div>

      {showGradients && canScrollUp && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 rounded-t-2xl bg-gradient-to-b from-background to-transparent" />
      )}
      {showGradients && canScrollDown && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  );
}
