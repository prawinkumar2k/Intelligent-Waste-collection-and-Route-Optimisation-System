import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
} from '../data/initialData';
import { GraphNode, GraphEdge } from '../types';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Cpu,
  Layers,
  HelpCircle,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type AlgorithmType =
  | 'Dijkstra'
  | 'A*'
  | 'D* Lite'
  | 'Greedy Heuristic'
  | 'Priority Queue'
  | 'BFS'
  | 'DFS';

interface StepState {
  currentNodeId: string | null;
  visitedNodeIds: string[];
  frontierNodeIds: string[];
  currentPath: string[];
  distances: Record<string, number>;
  heuristics?: Record<string, number>;
  explanation: string;
}

export const AlgorithmLabPage: React.FC = () => {
  const { showToast } = useApp();

  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_GRAPH_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_GRAPH_EDGES);

  const [startNodeId, setStartNodeId] = useState<string>('N-DEPOT');
  const [destNodeId, setDestNodeId] = useState<string>('N-DISPOSAL');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('A*');

  // Interactive controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState(800);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Computed steps for the current graph & algorithm
  const [steps, setSteps] = useState<StepState[]>([]);
  const [finalPath, setFinalPath] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  // Build adjacency graph & execute algorithmic simulation
  const computeAlgorithmSteps = useCallback(() => {
    const adj: Record<string, { target: string; weight: number; edgeId: string }[]> = {};
    nodes.forEach(n => {
      adj[n.id] = [];
    });

    edges.forEach(e => {
      if (!e.isBlocked) {
        if (!adj[e.source]) adj[e.source] = [];
        if (!adj[e.target]) adj[e.target] = [];
        adj[e.source].push({ target: e.target, weight: e.weight, edgeId: e.id });
        adj[e.target].push({ target: e.source, weight: e.weight, edgeId: e.id });
      }
    });

    const recordedSteps: StepState[] = [];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();

    nodes.forEach(n => {
      distances[n.id] = Infinity;
      previous[n.id] = null;
    });

    distances[startNodeId] = 0;

    // Euclidean distance heuristic for A* and D* Lite
    const destNode = nodes.find(n => n.id === destNodeId);
    const getHeuristic = (nodeId: string) => {
      if (!destNode) return 0;
      const n = nodes.find(item => item.id === nodeId);
      if (!n) return 0;
      const dx = (destNode.x - n.x) / 100;
      const dy = (destNode.y - n.y) / 100;
      return Number(Math.sqrt(dx * dx + dy * dy).toFixed(1));
    };

    if (algorithm === 'BFS') {
      const queue: string[] = [startNodeId];
      visited.add(startNodeId);
      recordedSteps.push({
        currentNodeId: startNodeId,
        visitedNodeIds: Array.from(visited),
        frontierNodeIds: [...queue],
        currentPath: [startNodeId],
        distances: { [startNodeId]: 0 },
        explanation: `BFS initialized at start node ${startNodeId}.`,
      });

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr === destNodeId) break;

        const neighbors = adj[curr] || [];
        for (const nb of neighbors) {
          if (!visited.has(nb.target)) {
            visited.add(nb.target);
            previous[nb.target] = curr;
            distances[nb.target] = (distances[curr] || 0) + 1;
            queue.push(nb.target);
            recordedSteps.push({
              currentNodeId: nb.target,
              visitedNodeIds: Array.from(visited),
              frontierNodeIds: [...queue],
              currentPath: [curr, nb.target],
              distances: { ...distances },
              explanation: `Explored unvisited neighbor ${nb.target} via FIFO queue.`,
            });
          }
        }
      }
    } else if (algorithm === 'DFS') {
      const stack: string[] = [startNodeId];
      recordedSteps.push({
        currentNodeId: startNodeId,
        visitedNodeIds: [],
        frontierNodeIds: [startNodeId],
        currentPath: [startNodeId],
        distances: { [startNodeId]: 0 },
        explanation: `DFS initialized with start node ${startNodeId} pushed onto stack.`,
      });

      while (stack.length > 0) {
        const curr = stack.pop()!;
        if (!visited.has(curr)) {
          visited.add(curr);
          recordedSteps.push({
            currentNodeId: curr,
            visitedNodeIds: Array.from(visited),
            frontierNodeIds: [...stack],
            currentPath: [curr],
            distances: { ...distances },
            explanation: `Popped ${curr} from stack and marked visited.`,
          });
          if (curr === destNodeId) break;

          const neighbors = adj[curr] || [];
          for (const nb of neighbors) {
            if (!visited.has(nb.target)) {
              previous[nb.target] = curr;
              distances[nb.target] = (distances[curr] || 0) + 1;
              stack.push(nb.target);
            }
          }
        }
      }
    } else {
      // Dijkstra / A* / D* Lite / Greedy priority search
      const pq: { id: string; priority: number }[] = [
        { id: startNodeId, priority: algorithm === 'A*' ? getHeuristic(startNodeId) : 0 },
      ];

      recordedSteps.push({
        currentNodeId: startNodeId,
        visitedNodeIds: [],
        frontierNodeIds: [startNodeId],
        currentPath: [startNodeId],
        distances: { [startNodeId]: 0 },
        explanation: `${algorithm} initialized. Tentative distance g(${startNodeId}) = 0.`,
      });

      while (pq.length > 0) {
        // Pop lowest priority
        pq.sort((a, b) => a.priority - b.priority);
        const { id: curr } = pq.shift()!;

        if (visited.has(curr)) continue;
        visited.add(curr);

        recordedSteps.push({
          currentNodeId: curr,
          visitedNodeIds: Array.from(visited),
          frontierNodeIds: pq.map(p => p.id),
          currentPath: [curr],
          distances: { ...distances },
          explanation: `Visiting node ${curr} with verified minimal cost ${distances[curr]?.toFixed(1)} km.`,
        });

        if (curr === destNodeId) break;

        const neighbors = adj[curr] || [];
        for (const nb of neighbors) {
          if (visited.has(nb.target)) continue;
          const tentativeG = distances[curr] + nb.weight;

          if (tentativeG < distances[nb.target]) {
            distances[nb.target] = Number(tentativeG.toFixed(1));
            previous[nb.target] = curr;

            let priority = tentativeG;
            if (algorithm === 'A*') {
              priority = tentativeG + getHeuristic(nb.target);
            } else if (algorithm === 'Greedy Heuristic') {
              priority = getHeuristic(nb.target);
            } else if (algorithm === 'D* Lite') {
              priority = tentativeG + getHeuristic(nb.target) * 0.95;
            }

            pq.push({ id: nb.target, priority });

            recordedSteps.push({
              currentNodeId: curr,
              visitedNodeIds: Array.from(visited),
              frontierNodeIds: pq.map(p => p.id),
              currentPath: [curr, nb.target],
              distances: { ...distances },
              explanation: `Relaxed edge (${curr} ➔ ${nb.target}). New cost g=${tentativeG.toFixed(1)}${
                algorithm === 'A*' ? `, h=${getHeuristic(nb.target)}` : ''
              }.`,
            });
          }
        }
      }
    }

    // Reconstruct final path
    const path: string[] = [];
    let cur: string | null = destNodeId;
    while (cur) {
      path.unshift(cur);
      cur = previous[cur];
      if (cur === startNodeId) {
        path.unshift(startNodeId);
        break;
      }
    }

    const pathFound = path[0] === startNodeId && path[path.length - 1] === destNodeId;
    const resolvedPath = pathFound ? path : [];
    const cost = distances[destNodeId] !== Infinity ? distances[destNodeId] : 0;

    setSteps(recordedSteps);
    setFinalPath(resolvedPath);
    setTotalCost(cost);
    setStepIndex(0);
    setIsPlaying(false);
  }, [nodes, edges, startNodeId, destNodeId, algorithm]);

  useEffect(() => {
    computeAlgorithmSteps();
  }, [computeAlgorithmSteps]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setStepIndex(prev => Math.min(steps.length - 1, prev + 1));
    }, playbackSpeedMs);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps.length, playbackSpeedMs]);

  const currentStep = steps[stepIndex] || {
    currentNodeId: null,
    visitedNodeIds: [],
    frontierNodeIds: [],
    currentPath: [],
    distances: {},
    explanation: 'Ready to begin simulation.',
  };

  // Toggle edge blocked status
  const handleToggleBlockEdge = (edgeId: string) => {
    setEdges(prev =>
      prev.map(e => (e.id === edgeId ? { ...e, isBlocked: !e.isBlocked } : e))
    );
    showToast('Graph Modified', 'Edge blockage state updated. Re-evaluating graph...', 'info');
  };

  const handleUpdateEdgeWeight = (edgeId: string, delta: number) => {
    setEdges(prev =>
      prev.map(e => {
        if (e.id !== edgeId) return e;
        const newWeight = Math.max(1.0, Number((e.weight + delta).toFixed(1)));
        return { ...e, weight: newWeight };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Algorithm Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Algorithm Laboratory & Graph Sandbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive visual simulation of pathfinding heuristics on the Perundurai municipal road graph
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['A*', 'Dijkstra', 'D* Lite', 'Greedy Heuristic', 'BFS', 'DFS'] as AlgorithmType[]).map(alg => (
            <button
              key={alg}
              onClick={() => setAlgorithm(alg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                algorithm === alg
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox Visualizer Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        {/* Playback & Step Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={() => setStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
              disabled={isPlaying || stepIndex >= steps.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Next Step</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setStepIndex(0);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Reset simulation to step 0"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <span className="text-xs text-slate-500 font-mono pl-2">
              Step {stepIndex + 1} of {steps.length || 1}
            </span>
          </div>

          {/* Speed & Node Pickers */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Origin:</span>
              <select
                value={startNodeId}
                onChange={e => setStartNodeId(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Goal:</span>
              <select
                value={destNodeId}
                onChange={e => setDestNodeId(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Speed:</span>
              <select
                value={playbackSpeedMs}
                onChange={e => setPlaybackSpeedMs(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs"
              >
                <option value={1400}>0.5x Slow</option>
                <option value={800}>1x Normal</option>
                <option value={350}>2x Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* SVG Graph Visualization Area */}
        <div className="relative w-full h-[440px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          <svg className="w-full h-full select-none" viewBox="0 0 880 440">
            {/* Grid Pattern */}
            <defs>
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Edges */}
            {edges.map(edge => {
              const src = nodes.find(n => n.id === edge.source);
              const tgt = nodes.find(n => n.id === edge.target);
              if (!src || !tgt) return null;

              // Check if edge is in the final optimal path
              const isPathEdge =
                finalPath.length > 1 &&
                stepIndex === steps.length - 1 &&
                finalPath.some(
                  (nid, idx) =>
                    (nid === edge.source && finalPath[idx + 1] === edge.target) ||
                    (nid === edge.target && finalPath[idx + 1] === edge.source)
                );

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g
                  key={edge.id}
                  onClick={() => handleToggleBlockEdge(edge.id)}
                  className="cursor-pointer group"
                >
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      edge.isBlocked
                        ? '#ef4444'
                        : isPathEdge
                        ? '#10b981'
                        : '#334155'
                    }
                    strokeWidth={isPathEdge ? 5 : edge.isBlocked ? 2.5 : 2}
                    strokeDasharray={edge.isBlocked ? '6,4' : undefined}
                    className="transition-all duration-300 group-hover:stroke-emerald-400"
                  />
                  {/* Edge weight tag */}
                  <rect
                    x={midX - 16}
                    y={midY - 10}
                    width={32}
                    height={20}
                    rx={5}
                    fill={edge.isBlocked ? '#450a0a' : '#0f172a'}
                    stroke={edge.isBlocked ? '#ef4444' : '#334155'}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={edge.isBlocked ? '#fca5a5' : '#94a3b8'}
                    fontSize={10}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.isBlocked ? 'X' : edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const isStart = node.id === startNodeId;
              const isDest = node.id === destNodeId;
              const isCurrent = currentStep.currentNodeId === node.id;
              const isVisited = currentStep.visitedNodeIds.includes(node.id);
              const isFrontier = currentStep.frontierNodeIds.includes(node.id);
              const inFinalPath =
                stepIndex === steps.length - 1 && finalPath.includes(node.id);

              let fillColor = '#1e293b';
              let strokeColor = '#475569';
              if (inFinalPath) {
                fillColor = '#065f46';
                strokeColor = '#10b981';
              } else if (isCurrent) {
                fillColor = '#0284c7';
                strokeColor = '#38bdf8';
              } else if (isVisited) {
                fillColor = '#334155';
                strokeColor = '#64748b';
              } else if (isFrontier) {
                fillColor = '#854d0e';
                strokeColor = '#facc15';
              } else if (isStart) {
                fillColor = '#1e3a8a';
                strokeColor = '#60a5fa';
              } else if (isDest) {
                fillColor = '#701a75';
                strokeColor = '#f472b6';
              }

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Current exploring halo */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                      className="animate-spin"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={9}
                    fontWeight="bold"
                  >
                    {isStart ? 'START' : isDest ? 'GOAL' : node.id.replace('N-', '')}
                  </text>
                  {/* Label below */}
                  <text
                    x={node.x}
                    y={node.y + 30}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize={11}
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                  {/* Tentative cost label */}
                  {currentStep.distances[node.id] !== undefined &&
                    currentStep.distances[node.id] !== Infinity && (
                      <text
                        x={node.x}
                        y={node.y - 22}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize={10}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        g={currentStep.distances[node.id]}
                      </text>
                    )}
                </g>
              );
            })}
          </svg>

          {/* Quick instructions floating badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 text-white text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-emerald-400" />
            <span>Click any edge to toggle Road Block / Construction detour</span>
          </div>

          {/* Live Step Explanation Bar */}
          <div className="absolute top-3 left-3 right-3 bg-slate-900/95 border border-slate-800 text-slate-200 text-xs px-4 py-2 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono text-emerald-400 font-bold shrink-0">
                [{algorithm}]
              </span>
              <span className="truncate">{currentStep.explanation}</span>
            </div>
            {finalPath.length > 0 && stepIndex === steps.length - 1 && (
              <span className="text-emerald-400 font-bold text-xs shrink-0 pl-3">
                Final Optimal Path: {finalPath.join(' ➔ ')} (Cost: {totalCost} km)
              </span>
            )}
          </div>
        </div>

        {/* Algorithm Theory & Mechanics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Algorithm Mechanics */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-emerald-500" />
              <span>Algorithm Mechanics: {algorithm}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {algorithm === 'A*' &&
                'Calculates f(n) = g(n) + h(n), where g(n) is the exact road distance from depot and h(n) is admissible Euclidean distance to the disposal yard. Guarantees shortest path while exploring far fewer nodes than Dijkstra.'}
              {algorithm === 'Dijkstra' &&
                'Uniform-cost graph traversal expanding nodes strictly by tentative cost g(n). Guarantees optimality across non-negative road weights, but explores nodes in all directions radially.'}
              {algorithm === 'D* Lite' &&
                'Incremental heuristic search suited for unknown or dynamic terrain. Re-plans paths rapidly when roadside obstructions occur without rebuilding the full graph from scratch.'}
              {algorithm === 'Greedy Heuristic' &&
                'Selects candidate vertex minimizing heuristic distance h(n) alone. Fast but vulnerable to local minima and suboptimal total mileage.'}
              {algorithm === 'Priority Queue' &&
                'Maintains candidates in min-heap based on municipal fill level and urgency weight before shortest distance tie-breaking.'}
              {algorithm === 'BFS' &&
                'Breadth-first exploration using FIFO queue. Finds unweighted shortest hop path.'}
              {algorithm === 'DFS' &&
                'Depth-first graph exploration. Useful for cycle detection and connectivity verification.'}
            </p>
          </div>

          {/* Time Complexity */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Complexity & Pruning Metrics
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Time Complexity:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {algorithm === 'BFS' || algorithm === 'DFS'
                    ? 'O(V + E)'
                    : 'O((V + E) log V)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Space Complexity:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  O(V)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nodes Explored:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {currentStep.visitedNodeIds.length} of {nodes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Route Distance:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {totalCost} km
                </span>
              </div>
            </div>
          </div>

          {/* Backend Roadmap Note */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Java Backend Integration Roadmap
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This visual laboratory serves for academic pilot validation in Perundurai. In the
              subsequent phase, a Java Spring Boot microservice will consume OpenStreetMap PBF
              extracts for Erode District and expose REST endpoints (
              <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/api/v1/routes/optimize</code>
              ) with turnkey GraphHopper engine support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
