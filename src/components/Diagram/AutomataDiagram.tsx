import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Automaton } from '../../types/automata';
import { EPSILON } from '../../types/automata';
import { isEpsilon } from '../../utils/automataEngine';
import { Maximize2, Minimize2, RotateCcw, Download } from 'lucide-react';

interface AutomataDiagramProps {
  automaton: Automaton;
  title?: string;
  activeStates?: string[]; // for simulation highlighting
  highlightTransition?: { from: string; symbol: string; to: string } | null;
}

interface EdgeData {
  from: string;
  to: string;
  symbols: string[];
  isSelfLoop: boolean;
  isBidirectional: boolean;
  reverseExists: boolean;
}

export const AutomataDiagram: React.FC<AutomataDiagramProps> = ({
  automaton,
  title,
  activeStates = [],
  highlightTransition = null,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan and Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate default node layout
  const resetLayout = () => {
    const states = automaton.states;
    const n = states.length;
    const newPos: Record<string, { x: number; y: number }> = {};

    const width = 640;
    const height = 380;
    const cx = width / 2;
    const cy = height / 2;

    if (n <= 4) {
      // Horizontal linear layout with vertical curve if needed
      const spacing = Math.min(170, (width - 160) / Math.max(1, n - 1));
      const startX = cx - ((n - 1) * spacing) / 2;
      states.forEach((st, idx) => {
        newPos[st] = {
          x: startX + idx * spacing,
          y: cy + (idx % 2 === 1 && n > 2 ? 15 : -15),
        };
      });
    } else {
      // Circle layout
      const radius = Math.min(150, 45 + n * 24);
      states.forEach((st, idx) => {
        const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
        newPos[st] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        };
      });
    }

    setPositions(newPos);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Re-layout whenever states list changes meaningfully
  useEffect(() => {
    resetLayout();
  }, [automaton.states.join(','), automaton.initialState]);

  // Aggregate transitions into combined edges
  const edges = useMemo<EdgeData[]>(() => {
    const edgeMap: Record<string, string[]> = {};

    for (const [from, trans] of Object.entries(automaton.transitions)) {
      if (!trans) continue;
      for (const [sym, targets] of Object.entries(trans)) {
        if (!targets) continue;
        for (const to of targets) {
          const key = `${from}===>${to}`;
          if (!edgeMap[key]) {
            edgeMap[key] = [];
          }
          if (!edgeMap[key].includes(sym)) {
            edgeMap[key].push(sym);
          }
        }
      }
    }

    const result: EdgeData[] = [];
    const keys = Object.keys(edgeMap);

    for (const key of keys) {
      const [from, to] = key.split('===>');
      const symbols = edgeMap[key];
      const isSelf = from === to;
      const reverseKey = `${to}===>${from}`;
      const reverseExists = !isSelf && keys.includes(reverseKey);

      result.push({
        from,
        to,
        symbols,
        isSelfLoop: isSelf,
        isBidirectional: reverseExists,
        reverseExists,
      });
    }

    return result;
  }, [automaton.transitions]);

  // Mouse drag handling for states
  const handleMouseDownNode = (stateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = positions[stateId] || { x: 0, y: 0 };
    setDraggingNode(stateId);
    setDragOffset({
      x: e.clientX / zoom - pos.x,
      y: e.clientY / zoom - pos.y,
    });
  };

  const handleMouseDownSvg = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const newX = e.clientX / zoom - dragOffset.x;
      const newY = e.clientY / zoom - dragOffset.y;
      setPositions(prev => ({
        ...prev,
        [draggingNode]: { x: newX, y: newY },
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  // Touch handlers for mobile devices
  const [touchPinchDist, setTouchPinchDist] = useState<number | null>(null);

  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStartNode = (stateId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = positions[stateId] || { x: 0, y: 0 };
      setDraggingNode(stateId);
      setDragOffset({
        x: touch.clientX / zoom - pos.x,
        y: touch.clientY / zoom - pos.y,
      });
    }
  };

  const handleTouchStartSvg = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      setTouchPinchDist(null);
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      setDraggingNode(null);
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      setTouchPinchDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (draggingNode) {
        const newX = touch.clientX / zoom - dragOffset.x;
        const newY = touch.clientY / zoom - dragOffset.y;
        setPositions(prev => ({
          ...prev,
          [draggingNode]: { x: newX, y: newY },
        }));
      } else if (isPanning) {
        setPan({
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        });
      }
    } else if (e.touches.length === 2 && touchPinchDist !== null) {
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = dist / touchPinchDist;
      setZoom(prev => Math.min(2.0, Math.max(0.4, prev * factor)));
      setTouchPinchDist(dist);
    }
  };

  const handleTouchEnd = () => {
    setDraggingNode(null);
    setIsPanning(false);
    setTouchPinchDist(null);
  };

  // Export diagram as SVG
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${automaton.name || 'automaton'}-diagram.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const NODE_RADIUS = 28;

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg border border-slate-700/60 bg-[#1a2535] overflow-hidden flex flex-col font-mono shadow-xs"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-700/60 bg-[#222d3d]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            {title || `${automaton.type} State Diagram`}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            |Q| = {automaton.states.length}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.15))}
            className="min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetLayout}
            className="min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Diagram Layout"
            aria-label="Reset layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportSvg}
            className="min-h-[32px] sm:min-h-[36px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs px-2.5 ml-1"
            title="Download SVG Diagram"
            aria-label="Export diagram as SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SVG</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas with touch drag & pinch zoom */}
      <div
        className="w-full h-64 sm:h-80 md:h-96 cursor-grab active:cursor-grabbing select-none relative bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px] touch-none"
        onMouseDown={handleMouseDownSvg}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStartSvg}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 640 380"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Standard arrow marker */}
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38BDF8" />
            </marker>

            {/* Epsilon marker */}
            <marker
              id="arrowhead-eps"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#C084FC" />
            </marker>

            {/* Highlighted active marker */}
            <marker
              id="arrowhead-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#34D399" />
            </marker>

            {/* Gradient definitions */}
            <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#065F46" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="initialNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* 1. EDGES */}
            {edges.map((edge, idx) => {
              const posA = positions[edge.from];
              const posB = positions[edge.to];
              if (!posA || !posB) return null;

              const hasEps = edge.symbols.some(isEpsilon);
              const label = edge.symbols
                .map(s => (isEpsilon(s) ? EPSILON : s))
                .join(', ');

              const isHighlighted =
                highlightTransition &&
                highlightTransition.from === edge.from &&
                highlightTransition.to === edge.to &&
                edge.symbols.includes(highlightTransition.symbol);

              const strokeColor = isHighlighted
                ? '#34D399'
                : hasEps
                ? '#A855F7'
                : '#38BDF8';
              const markerId = isHighlighted
                ? 'arrowhead-active'
                : hasEps
                ? 'arrowhead-eps'
                : 'arrowhead';

              // SELF LOOP
              if (edge.isSelfLoop) {
                const sx = posA.x;
                const sy = posA.y - NODE_RADIUS;
                const pathD = `M ${sx - 12} ${sy + 2} C ${sx - 35} ${sy - 48}, ${sx + 35} ${sy - 48}, ${sx + 10} ${sy + 2}`;

                return (
                  <g key={`edge-${idx}`} className="transition-all duration-300">
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHighlighted ? 2.8 : 1.8}
                      strokeDasharray={hasEps ? '4,3' : 'none'}
                      markerEnd={`url(#${markerId})`}
                    />
                    {/* Self loop label */}
                    <rect
                      x={sx - 18}
                      y={sy - 45}
                      width={36}
                      height={18}
                      rx={4}
                      fill="#0B0F19"
                      stroke={strokeColor}
                      strokeWidth="1"
                      className="opacity-95"
                    />
                    <text
                      x={sx}
                      y={sy - 32}
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="11"
                      fontWeight="600"
                      className="font-mono select-none"
                    >
                      {label}
                    </text>
                  </g>
                );
              }

              // DIRECTED TRANSITION BETWEEN TWO NODES
              const dx = posB.x - posA.x;
              const dy = posB.y - posA.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;

              const ux = dx / dist;
              const uy = dy / dist;

              // If bidirectional, curve the arc so both directions don't collide
              const curvature = edge.reverseExists ? 28 : 0;
              const perpX = -uy * curvature;
              const perpY = ux * curvature;

              const midX = (posA.x + posB.x) / 2 + perpX;
              const midY = (posA.y + posB.y) / 2 + perpY;

              // Calculate start and end at perimeter
              const startX = posA.x + ux * NODE_RADIUS;
              const startY = posA.y + uy * NODE_RADIUS;
              const endX = posB.x - ux * (NODE_RADIUS + 4);
              const endY = posB.y - uy * (NODE_RADIUS + 4);

              const pathD =
                curvature === 0
                  ? `M ${startX} ${startY} L ${endX} ${endY}`
                  : `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

              const labelX = curvature === 0 ? midX : (startX + 2 * midX + endX) / 4;
              const labelY = curvature === 0 ? midY : (startY + 2 * midY + endY) / 4;

              return (
                <g key={`edge-${idx}`} className="transition-all duration-300">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.8 : 1.8}
                    strokeDasharray={hasEps ? '4,3' : 'none'}
                    markerEnd={`url(#${markerId})`}
                  />
                  {/* Badge background for symbol label */}
                  <rect
                    x={labelX - 16}
                    y={labelY - 11}
                    width={32}
                    height={18}
                    rx={4}
                    fill="#0F172A"
                    stroke={strokeColor}
                    strokeWidth="1"
                    className="opacity-95"
                  />
                  <text
                    x={labelX}
                    y={labelY + 2}
                    textAnchor="middle"
                    fill={isHighlighted ? '#34D399' : hasEps ? '#D8B4FE' : '#BAE6FD'}
                    fontSize="11"
                    fontWeight="700"
                    className="font-mono select-none"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* 2. INITIAL STATE ARROW */}
            {automaton.initialState && positions[automaton.initialState] && (
              <g>
                {(() => {
                  const initPos = positions[automaton.initialState];
                  const arrowStartX = initPos.x - 65;
                  const arrowStartY = initPos.y;
                  const arrowEndX = initPos.x - (NODE_RADIUS + 6);
                  return (
                    <>
                      <path
                        d={`M ${arrowStartX} ${arrowStartY} L ${arrowEndX} ${arrowStartY}`}
                        fill="none"
                        stroke="#818CF8"
                        strokeWidth="2.2"
                        markerEnd="url(#arrowhead)"
                      />
                      <rect
                        x={arrowStartX - 28}
                        y={arrowStartY - 10}
                        width={30}
                        height={18}
                        rx={4}
                        fill="#1E1B4B"
                        stroke="#6366F1"
                        strokeWidth="1"
                      />
                      <text
                        x={arrowStartX - 13}
                        y={arrowStartY + 3}
                        textAnchor="middle"
                        fill="#C7D2FE"
                        fontSize="10"
                        fontWeight="700"
                        className="select-none font-sans"
                      >
                        Start
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* 3. STATES / NODES */}
            {automaton.states.map(state => {
              const pos = positions[state];
              if (!pos) return null;

              const isInitial = state === automaton.initialState;
              const isFinal = automaton.finalStates.includes(state);
              const isActive = activeStates.includes(state);

              let borderColor = '#475569';
              let fillGradient = 'url(#nodeGrad)';

              if (isActive) {
                borderColor = '#34D399';
                fillGradient = 'url(#activeNodeGrad)';
              } else if (isFinal) {
                borderColor = '#A855F7';
              } else if (isInitial) {
                borderColor = '#6366F1';
                fillGradient = 'url(#initialNodeGrad)';
              }

              return (
                <g
                  key={`node-${state}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={e => handleMouseDownNode(state, e)}
                  onTouchStart={e => handleTouchStartNode(state, e)}
                  className="cursor-move group"
                >
                  {/* Outer circle */}
                  <circle
                    r={NODE_RADIUS}
                    fill={fillGradient}
                    stroke={borderColor}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-200 group-hover:filter group-hover:brightness-125"
                  />

                  {/* Concentric inner circle for final state */}
                  {isFinal && (
                    <circle
                      r={NODE_RADIUS - 5}
                      fill="none"
                      stroke={isActive ? '#34D399' : '#C084FC'}
                      strokeWidth={1.8}
                    />
                  )}

                  {/* State text label */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fill={isActive ? '#ECFDF5' : '#F8FAFC'}
                    fontSize={state.length > 5 ? '9' : state.length > 3 ? '11' : '13'}
                    fontWeight="700"
                    className="font-mono select-none pointer-events-none"
                  >
                    {state}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend / Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-3 bg-[#222d3d]/95 border border-slate-700/60 px-2.5 py-1 rounded text-[11px] text-slate-300 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-indigo-400 bg-indigo-900/80 inline-block" />
              <span>Initial</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-purple-400 inline-block" />
              <span>Accepting</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              <span>Move</span>
            </span>
            {automaton.type === 'ENFA' && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-purple-400 border-t border-dashed border-purple-400 inline-block" />
                <span>ε-Move</span>
              </span>
            )}
          </div>

          <div className="text-[10px] text-slate-400 bg-[#222d3d]/95 px-2 py-0.5 rounded border border-slate-700/60 shadow-xs">
            Drag nodes to adjust layout
          </div>
        </div>
      </div>
    </div>
  );
};
