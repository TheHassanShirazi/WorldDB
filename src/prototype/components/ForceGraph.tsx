"use client";

/**
 * PROTOTYPE — canvas force graph.
 *
 * react-force-graph renders to canvas and touches `window` on import, so it
 * must be loaded with `ssr: false`. Next 16 only permits that inside a Client
 * Component, which is why this file carries the "use client" directive and the
 * variants import it rather than importing the library themselves.
 */

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphData, GraphNode } from "@/domain";

// The library ships loose types that fight the dynamic() wrapper. Prototype
// code — a single cast here is cheaper than modelling the whole prop surface.
type LooseProps = Record<string, unknown>;
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
}) as unknown as React.ComponentType<LooseProps>;

interface Props {
  data: GraphData;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Dim everything not adjacent to the selection. */
  highlightNeighbours?: boolean;
  /** Larger for the focus view, where there are only a dozen nodes. */
  scale?: number;
  /**
   * Pan/zoom the canvas to this node when it changes. Used by the command
   * palette so a search result actually takes you somewhere.
   */
  centerOn?: string | null;
}

/** Only the slice of the imperative API this prototype touches. */
interface GraphApi {
  centerAt?: (x: number, y: number, ms?: number) => void;
  zoom?: (z: number, ms?: number) => void;
}

function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

export function ForceGraph({
  data,
  selectedId,
  onSelect,
  highlightNeighbours = true,
  scale = 1,
  centerOn,
}: Props) {
  const { ref, size } = useSize();
  const apiRef = useRef<GraphApi | null>(null);

  // The simulation writes x/y onto the node objects, so a node picked before
  // the layout settles has no position yet — retry briefly rather than jump.
  useEffect(() => {
    if (!centerOn) return;
    let tries = 0;
    const id = setInterval(() => {
      const node = data.nodes.find((n) => n.id === centerOn);
      const api = apiRef.current;
      if (node?.x != null && node.y != null && typeof api?.centerAt === "function") {
        api.centerAt(node.x, node.y, 600);
        api.zoom?.(2.4, 600);
        clearInterval(id);
      }
      if (++tries > 20) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [centerOn, data.nodes]);

  const adjacent = useMemo(() => {
    if (!selectedId || !highlightNeighbours) return null;
    const set = new Set<string>([selectedId]);
    for (const l of data.links) {
      const s = typeof l.source === "string" ? l.source : (l.source as unknown as GraphNode).id;
      const t = typeof l.target === "string" ? l.target : (l.target as unknown as GraphNode).id;
      if (s === selectedId) set.add(t);
      if (t === selectedId) set.add(s);
    }
    return set;
  }, [selectedId, data.links, highlightNeighbours]);

  return (
    <div ref={ref} className="h-full w-full">
      {size.w > 0 && size.h > 0 && (
        <ForceGraph2D
          ref={apiRef}
          width={size.w}
          height={size.h}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          cooldownTicks={120}
          d3VelocityDecay={0.32}
          linkColor={(l: unknown) => {
            const link = l as { color: string; source: unknown; target: unknown };
            if (!adjacent) return link.color;
            const s = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
            const t = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
            return adjacent.has(s) && adjacent.has(t) ? link.color : "rgba(120,120,130,0.10)";
          }}
          linkWidth={(l: unknown) => {
            const link = l as { source: unknown; target: unknown };
            if (!adjacent) return 1;
            const s = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
            const t = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
            return adjacent.has(s) && adjacent.has(t) ? 2 : 1;
          }}
          linkDirectionalArrowLength={(l: unknown) =>
            (l as { directed: boolean }).directed ? 3.2 : 0
          }
          linkDirectionalArrowRelPos={0.98}
          onNodeClick={(n: unknown) => onSelect?.((n as GraphNode).id)}
          nodeCanvasObject={(n: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const node = n as GraphNode;
            if (node.x == null || node.y == null) return;
            const dim = adjacent ? !adjacent.has(node.id) : false;
            const r = (3.5 + Math.sqrt(node.val) * 1.35) * scale;

            ctx.globalAlpha = dim ? 0.22 : 1;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = node.color;
            ctx.fill();

            if (node.id === selectedId) {
              ctx.lineWidth = 2 / globalScale;
              ctx.strokeStyle = "#f7f4ef";
              ctx.stroke();
            }

            const showLabel = globalScale > 1.1 || node.val > 5 || node.id === selectedId;
            if (showLabel) {
              const fontSize = Math.max(10 / globalScale, 2.4);
              ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = dim ? "rgba(230,228,222,0.25)" : "rgba(230,228,222,0.92)";
              ctx.fillText(node.name, node.x, node.y + r + 1.5);
            }
            ctx.globalAlpha = 1;
          }}
          nodePointerAreaPaint={(n: unknown, color: string, ctx: CanvasRenderingContext2D) => {
            const node = n as GraphNode;
            if (node.x == null || node.y == null) return;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, (3.5 + Math.sqrt(node.val) * 1.35) * scale + 3, 0, 2 * Math.PI);
            ctx.fill();
          }}
        />
      )}
    </div>
  );
}
