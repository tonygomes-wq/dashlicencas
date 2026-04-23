import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    ReactFlowInstance,
    Panel,
    BackgroundVariant,
    Handle,
    Position,
    NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Cloud,
    Shield,
    Router,
    Server,
    Monitor,
    HardDrive,
    Globe,
    Search,
    Save,
    Trash2,
    MousePointer2,
    Type,
    ArrowRight,
    Settings,
    Edit3,
    ChevronDown,
    PlusCircle,
    Download,
    Link as LinkIcon,
    Laptop,
    Smartphone,
    Printer,
    Wifi,
    Database,
    Lock,
    User,
    Cpu,
    Tablet,
    Network
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/apiClient';

// --- Icon Mapping ---
const iconMap: Record<string, React.ElementType> = {
    'Globe': Globe,
    'Shield': Shield,
    'Router': Router,
    'Server': Server,
    'Monitor': Monitor,
    'HardDrive': HardDrive,
    'Cloud': Cloud,
    'Laptop': Laptop,
    'Smartphone': Smartphone,
    'Printer': Printer,
    'Wifi': Wifi,
    'Database': Database,
    'Lock': Lock,
    'User': User,
    'Cpu': Cpu,
    'Tablet': Tablet,
    'Network': Network,
};

const getIconName = (icon: React.ElementType): string => {
    const entry = Object.entries(iconMap).find(([_, component]) => component === icon);
    return entry ? entry[0] : 'Globe';
};

const getIconComponent = (iconName: string): React.ElementType => {
    return iconMap[iconName] || Globe;
};

// --- Custom Node Components ---

const NetworkNode = ({ data, selected }: NodeProps) => {
    // Robustly retrieve icon, defaulting to Globe if missing or invalid
    let Icon = (data.icon as React.ElementType) || Globe;

    // Safety check: if Icon is not a valid component type (e.g. it's a plain object), fallback
    if (typeof Icon === 'object' && !(Icon as any).$$typeof && !(Icon as any).render) {
        Icon = Globe;
    }

    return (
        <div className={`px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-800 border-2 transition-all ${selected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-500" />
            <div className="flex flex-col items-center">
                <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-1">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{data.label as string}</div>
            </div>
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500" />
        </div>
    );
};

const nodeTypes = {
    networkNode: NetworkNode,
};

// --- Sidebar Item ---

const SidebarItem = ({ type, label, icon: Icon }: { type: string, label: string, icon: React.ElementType }) => {
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow-label', nodeLabel);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            onDragStart={(event: React.DragEvent) => onDragStart(event, 'networkNode', label)}
            draggable
        >
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 mb-2">
                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase text-center">{label}</span>
        </div>
    );
};

// --- Main Component ---

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'networkNode',
        data: { label: 'Internet', icon: getIconComponent('Globe') },
        position: { x: 250, y: 5 },
    },
    {
        id: '2',
        type: 'networkNode',
        data: { label: 'Firewall', icon: getIconComponent('Shield') },
        position: { x: 250, y: 150 },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
];

const NetworkMapSubTab: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [diagramId, setDiagramId] = useState<number | null>(null);
    const [diagramName, setDiagramName] = useState('Mapa de Rede Principal');
    const [availableDiagrams, setAvailableDiagrams] = useState<any[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [isNewDiagramModalOpen, setIsNewDiagramModalOpen] = useState(false);
    const [newDiagramName, setNewDiagramName] = useState('');
    const [isDiagramListOpen, setIsDiagramListOpen] = useState(false);

    // Load diagram list and first diagram on mount
    const loadAllDiagrams = useCallback(async () => {
        try {
            const diagrams = await apiClient.diagrams.list();
            setAvailableDiagrams(diagrams || []);
            return diagrams;
        } catch (error) {
            console.error("Error loading diagrams list:", error);
            return [];
        }
    }, []);

    const loadSpecificDiagram = useCallback(async (id: number) => {
        try {
            const diagram = await apiClient.diagrams.get(id);
            if (diagram && diagram.data) {
                const data = typeof diagram.data === 'string' ? JSON.parse(diagram.data) : diagram.data;

                // Restore icons from icon names with robust fallback
                const restoredNodes = (data.nodes || []).map((node: Node) => {
                    let Icon = Globe;
                    try {
                        if (typeof node.data.icon === 'string') {
                            Icon = getIconComponent(node.data.icon);
                        } else if (node.data.icon && (node.data.icon as any).$$typeof) {
                            // If it's already a React element (shouldn't happen with JSON, but for safety)
                            // We can't use it directly if it's an object, so we default to Globe
                            Icon = Globe;
                        } else if (typeof node.data.icon === 'object') {
                            // Handle corrupted object data
                            Icon = Globe;
                        }
                    } catch (e) {
                        console.warn("Failed to restore icon for node", node.id, e);
                    }

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            icon: Icon
                        }
                    };
                });

                setNodes(restoredNodes);
                setEdges(data.edges || []);
                setDiagramId(diagram.id);
                setDiagramName(diagram.name);
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
            }
        } catch (error) {
            console.error("Error loading specific diagram:", error);
            toast.error("Erro ao carregar o diagrama.");
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        loadAllDiagrams().then(diagrams => {
            if (diagrams && diagrams.length > 0) {
                loadSpecificDiagram(diagrams[0].id);
            }
        });
    }, [loadAllDiagrams, loadSpecificDiagram]);

    const selectedNode = useMemo(() =>
        nodes.find(n => n.id === selectedNodeId),
        [nodes, selectedNodeId]);

    const selectedEdge = useMemo(() =>
        edges.find(e => e.id === selectedEdgeId),
        [edges, selectedEdgeId]);

    const updateEdgeLabel = (id: string, newLabel: string) => {
        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.id === id) {
                    return {
                        ...edge,
                        label: newLabel,
                        labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 10 },
                        labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
                        labelBgPadding: [4, 2],
                        labelBgBorderRadius: 4,
                    };
                }
                return edge;
            })
        );
    };

    const updateNodeLabel = (id: string, newLabel: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: newLabel,
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleCreateNewDiagram = async () => {
        if (!newDiagramName.trim()) {
            toast.error("Por favor, digite um nome para o diagrama.");
            return;
        }

        try {
            // Convert icons to strings before saving
            const nodesToSave = initialNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    icon: getIconName(node.data.icon as React.ElementType)
                }
            }));

            const response = await apiClient.diagrams.save({
                name: newDiagramName,
                data: { nodes: nodesToSave, edges: initialEdges }
            });

            if (response.success) {
                toast.success("Novo diagrama criado!");
                setIsNewDiagramModalOpen(false);
                setNewDiagramName('');
                await loadAllDiagrams();
                loadSpecificDiagram(response.id);
            }
        } catch (error: any) {
            toast.error("Erro ao criar diagrama: " + error.message);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/reactflow-label');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            if (!position) return;

            // Map Portuguese labels to icon names
            const labelToIconMap: Record<string, string> = {
                'Nuvem': 'Cloud',
                'Firewall': 'Shield',
                'Roteador': 'Router',
                'Servidor': 'Server',
                'PC': 'Monitor',
                'Storage': 'HardDrive',
                'Internet': 'Globe',
                'Notebook': 'Laptop',
                'Celular': 'Smartphone',
                'Impressora': 'Printer',
                'Access Point': 'Wifi',
                'Banco de Dados': 'Database',
                'Segurança': 'Lock',
                'Usuário': 'User',
                'Processador': 'Cpu',
                'Tablet': 'Tablet',
                'Switch': 'Network'
            };

            const iconName = labelToIconMap[label] || 'Globe';
            const icon = getIconComponent(iconName);

            const newNode: Node = {
                id: `node_${Date.now()}`,
                type,
                position,
                data: { label, icon },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const handleDeleteDiagram = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Deseja realmente excluir este diagrama?")) return;

        try {
            await apiClient.diagrams.remove(id);
            toast.success("Diagrama excluído.");
            const newAvailable = await loadAllDiagrams();
            if (id === diagramId) {
                if (newAvailable && newAvailable.length > 0) {
                    loadSpecificDiagram(newAvailable[0].id);
                } else {
                    setNodes(initialNodes);
                    setEdges(initialEdges);
                    setDiagramId(null);
                    setDiagramName("Mapa de Rede Principal");
                }
            }
        } catch (error: any) {
            toast.error("Erro ao excluir: " + error.message);
        }
    };

    const handleSave = async () => {
        const flow = reactFlowInstance?.toObject();
        if (flow) {
            const toastId = toast.loading('Salvando mapa...');
            try {
                // Convert icons to strings before saving
                const nodesToSave = flow.nodes.map((node: Node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        icon: getIconName(node.data.icon as React.ElementType)
                    }
                }));

                const response = await apiClient.diagrams.save({
                    id: diagramId,
                    name: diagramName,
                    data: { ...flow, nodes: nodesToSave }
                });
                if (response.success) {
                    setDiagramId(response.id);
                    toast.success('Mapa salvo com sucesso!', { id: toastId });
                    loadAllDiagrams();
                }
            } catch (error: any) {
                toast.error('Erro ao salvar mapa: ' + error.message, { id: toastId });
            }
        }
    };

    const onSelectionChange = ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
        setSelectedNodeId(nodes[0]?.id || null);
        setSelectedEdgeId(edges[0]?.id || null);
    };

    const handleExport = async () => {
        if (!reactFlowWrapper.current) return;
        const toastId = toast.loading('Gerando imagem...');
        try {
            const dataUrl = await toPng(reactFlowWrapper.current, {
                backgroundColor: '#f9fafb',
                filter: (node) => {
                    if (
                        node?.classList?.contains('react-flow__controls') ||
                        node?.classList?.contains('react-flow__panel')
                    ) {
                        return false;
                    }
                    return true;
                },
            });
            download(dataUrl, `${diagramName || 'mapa-de-rede'}.png`);
            toast.success('Imagem exportada!', { id: toastId });
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Erro ao exportar imagem', { id: toastId });
        }
    };

    const menuItems = [
        { label: 'Internet', icon: Globe },
        { label: 'Firewall', icon: Shield },
        { label: 'Roteador', icon: Router },
        { label: 'Servidor', icon: Server },
        { label: 'PC', icon: Monitor },
        { label: 'Storage', icon: HardDrive },
        { label: 'Nuvem', icon: Cloud },
        { label: 'Switch', icon: Network },
        { label: 'Access Point', icon: Wifi },
        { label: 'Notebook', icon: Laptop },
        { label: 'Celular', icon: Smartphone },
        { label: 'Tablet', icon: Tablet },
        { label: 'Impressora', icon: Printer },
        { label: 'Banco de Dados', icon: Database },
        { label: 'Segurança', icon: Lock },
        { label: 'Usuário', icon: User },
        { label: 'Processador', icon: Cpu },
    ];

    const filteredItems = menuItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-250px)] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">

            {/* Sidebar (Miro-style) */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 overflow-visible">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center">
                            <Settings className="w-4 h-4 mr-2 text-blue-600" />
                            Diagramação
                        </h2>
                        <button
                            onClick={() => setIsNewDiagramModalOpen(true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-600 transition-colors"
                            title="Novo Diagrama"
                        >
                            <PlusCircle className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Diagram Selector */}
                    <div className="relative mb-4">
                        <button
                            onClick={() => setIsDiagramListOpen(!isDiagramListOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-left font-medium"
                        >
                            <span className="truncate">{diagramName}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isDiagramListOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDiagramListOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                                {availableDiagrams.map((d) => (
                                    <div
                                        key={d.id}
                                        className={`group flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer ${d.id === diagramId ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => {
                                            loadSpecificDiagram(d.id);
                                            setIsDiagramListOpen(false);
                                        }}
                                    >
                                        <span className="truncate flex-grow">{d.name}</span>
                                        <button
                                            onClick={(e: React.MouseEvent) => handleDeleteDiagram(d.id, e)}
                                            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md"
                                            title="Excluir Diagrama"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {availableDiagrams.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-gray-500 italic text-center">Nenhum salvo</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar ícones..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border-b border-gray-100 dark:border-gray-700">
                    {filteredItems.map((item) => (
                        <SidebarItem key={item.label} label={item.label} icon={item.icon} type="networkNode" />
                    ))}
                </div>

                {/* Node Properties Panel */}
                {selectedNode && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                            <Edit3 className="w-3 h-3 mr-2" />
                            Propriedades do Bloco
                        </div>
                        <label htmlFor="node-label" className="block text-[10px] text-gray-400 uppercase mb-1 font-bold">Nome do Dispositivo</label>
                        <input
                            id="node-label"
                            type="text"
                            value={selectedNode.data.label as string}
                            title="Nome do Dispositivo"
                            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                )}

                {/* Edge Properties Panel */}
                {selectedEdge && !selectedNode && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                            <LinkIcon className="w-3 h-3 mr-2" />
                            Propriedades do Link
                        </div>
                        <label htmlFor="edge-label" className="block text-[10px] text-gray-400 uppercase mb-1 font-bold">Etiqueta do Cabo (ex: IP/VLAN)</label>
                        <input
                            id="edge-label"
                            type="text"
                            value={(selectedEdge.label as string) || ''}
                            title="Etiqueta do Conector"
                            onChange={(e) => updateEdgeLabel(selectedEdge.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="ex: 192.168.1.1"
                        />
                    </div>
                )}

                <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Mapa
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-grow relative h-full bg-gray-50 dark:bg-gray-900" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onSelectionChange={onSelectionChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-dot-pattern"
                    snapToGrid
                    snapGrid={[15, 15]}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                    <Controls />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.type === 'networkNode') return '#3b82f6';
                            return '#eee';
                        }}
                        className="dark:bg-gray-800 dark:border-gray-600"
                    />

                    <Panel position="top-right" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex space-x-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors" title="Ponteiro">
                            <MousePointer2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors" title="Texto">
                            <Type className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors" title="Conector">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 self-center mx-1" />
                        <button
                            onClick={handleExport}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                            title="Exportar Imagem"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 self-center mx-1" />
                        <button
                            onClick={() => {
                                if (window.confirm('Limpar todo o mapa?')) {
                                    setNodes([]);
                                    setEdges([]);
                                }
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-red-600 transition-colors"
                            title="Limpar Tudo"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Modal para Novo Diagrama */}
            {isNewDiagramModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-96 max-w-full m-4">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Nome do Novo Mapa</h3>
                        <p className="text-sm text-gray-500 mb-4">Dê um nome ao diagrama (ex: Cliente Serra Contábil)</p>
                        <input
                            type="text"
                            autoFocus
                            placeholder="Digite o nome aqui..."
                            title="Nome do Novo Mapa"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newDiagramName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDiagramName(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateNewDiagram()}
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => { setIsNewDiagramModalOpen(false); setNewDiagramName(''); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateNewDiagram}
                                className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Criar Mapa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(#374151 1px, transparent 1px);
        }
      `}</style>
        </div>
    );
};

export default NetworkMapSubTab;
