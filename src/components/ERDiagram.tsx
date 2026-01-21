/**
 * ER Diagram Component using React Flow
 */

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ERDiagram, TableSchema, ERRelationship, ColumnDefinition } from '@/api/types';

// ============================================
// Custom Table Node
// ============================================

interface TableNodeData {
  label: string;
  columns: ColumnDefinition[];
}

function TableNode({ data }: { data: TableNodeData }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-[200px] overflow-hidden"
    >
      {/* Table Header */}
      <div className="px-4 py-2 bg-linear-to-r from-violet-600/20 to-fuchsia-600/20 border-b border-zinc-700">
        <h3 className="font-bold text-zinc-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          {data.label}
        </h3>
      </div>

      {/* Columns */}
      <div className="divide-y divide-zinc-800">
        {data.columns.map((col, index) => (
          <div
            key={index}
            className={cn(
              'px-4 py-2 flex items-center justify-between gap-4 text-sm',
              col.isPrimaryKey && 'bg-amber-500/10',
              col.isForeignKey && 'bg-blue-500/10'
            )}
          >
            <div className="flex items-center gap-2">
              {col.isPrimaryKey && (
                <span className="text-amber-400" title="Primary Key">
                  🔑
                </span>
              )}
              {col.isForeignKey && (
                <span className="text-blue-400" title="Foreign Key">
                  🔗
                </span>
              )}
              <span className={cn(
                'font-medium',
                col.isPrimaryKey ? 'text-amber-200' : 
                col.isForeignKey ? 'text-blue-200' : 'text-zinc-300'
              )}>
                {col.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">{col.type}</span>
              {col.isNotNull && (
                <span className="text-xs text-red-400" title="NOT NULL">NN</span>
              )}
              {col.isUnique && !col.isPrimaryKey && (
                <span className="text-xs text-purple-400" title="UNIQUE">UQ</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const nodeTypes: NodeTypes = {
  tableNode: TableNode,
};

// ============================================
// ER Diagram Component
// ============================================

interface ERDiagramViewProps {
  erDiagram: ERDiagram;
  height?: string;
}

export function ERDiagramView({ erDiagram, height = '500px' }: ERDiagramViewProps) {
  // Generate nodes from tables
  const initialNodes = useMemo<Node[]>(() => {
    const spacing = 350;
    const cols = Math.ceil(Math.sqrt(erDiagram.tables.length));

    return erDiagram.tables.map((table, index): Node => ({
      id: table.name,
      type: 'tableNode',
      position: {
        x: (index % cols) * spacing + 50,
        y: Math.floor(index / cols) * 300 + 50,
      },
      data: {
        label: table.name,
        columns: table.columns,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
  }, [erDiagram.tables]);

  // Generate edges from relationships
  const initialEdges = useMemo<Edge[]>(() => {
    return erDiagram.relationships.map((rel, index): Edge => ({
      id: `${rel.fromTable}-${rel.fromColumn}-${rel.toTable}-${rel.toColumn}-${index}`,
      source: rel.fromTable,
      target: rel.toTable,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8B5CF6', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#8B5CF6',
      },
      label: getRelationshipLabel(rel),
      labelStyle: { 
        fill: '#A1A1AA', 
        fontWeight: 500, 
        fontSize: 11,
      },
      labelBgStyle: { 
        fill: '#18181B', 
        fillOpacity: 0.9,
      },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
    }));
  }, [erDiagram.relationships]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-zinc-950" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        className="bg-zinc-950"
      >
        <Background color="#27272A" gap={20} size={1} />
        <Controls 
          className="bg-zinc-800 border-zinc-700 rounded-lg overflow-hidden"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-zinc-900 border-zinc-700 rounded-lg"
          nodeColor="#3F3F46"
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function getRelationshipLabel(rel: ERRelationship): string {
  switch (rel.type) {
    case 'one-to-one':
      return '1:1';
    case 'one-to-many':
      return '1:N';
    case 'many-to-many':
      return 'N:M';
    default:
      return '';
  }
}

// ============================================
// Single Table View (when no ER diagram)
// ============================================

interface SingleTableViewProps {
  table: TableSchema;
}

export function SingleTableView({ table }: SingleTableViewProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      <TableNode data={{ label: table.name, columns: table.columns }} />
    </motion.div>
  );
}
