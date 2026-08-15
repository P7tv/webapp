"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import ForceGraph2D to prevent SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function NetworkGraph({ data, width, height }: { data: any, width?: number, height?: number }) {
  const fgRef = useRef<any>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = useCallback(
    (node: any) => {
      // Focus on node
      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(8, 2000);
      }
      
      // If the node has an ID that looks like an account ID, navigate to it after a short delay
      if (node.id && !isNaN(Number(node.id))) {
        setTimeout(() => {
          router.push(`/officer/${node.id}`);
        }, 1500);
      }
    },
    [router]
  );

  if (!mounted) return <div className="h-full w-full bg-slate-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={data}
        nodeLabel="id"
        nodeColor={(node: any) => (node.group === 1 ? "#ef4444" : "rgba(16, 185, 129, 0.2)")}
        nodeRelSize={4}
        linkColor={(link: any) => {
          // If the target or source is high risk, make link slightly more visible, else very faint
          return "rgba(255,255,255,0.15)";
        }}
        linkWidth={(link: any) => Math.max(1, Math.sqrt(link.value) / 100)}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          // Draw the node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val || 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.group === 1 ? "#ef4444" : "rgba(16, 185, 129, 0.3)";
          ctx.fill();

          // Only draw text for High Risk nodes (group 1) to avoid clutter
          if (node.group === 1) {
            const label = node.id;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(label, node.x, node.y + (node.val || 4) + fontSize);
          }
        }}
        onNodeClick={handleNodeClick}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
    </div>
  );
}
