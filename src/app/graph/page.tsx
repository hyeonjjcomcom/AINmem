// app/page.tsx
"use client";  

import Sidebar from '../components/Sidebar';
import styles from './GraphPage.module.css';
import LinkModal from '../components/LinkModal';
import ConstantModal from '../components/ConstantModal';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ConstantData {
  value?: string;
  name?: string;
  constant?: string;
  description?: string;
}

interface NodeData {
  id: string;
  name: string;
  type: string;
  count: number;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  predicates: string[];
  descriptions: string[];
  values: string[];
  count: number;
}

interface FactItem {
  constants: string[];
  predicates: string[];
  description?: string;
  value?: string;
}

export default function HomePage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [constantsData, setConstantsData] = useState<ConstantData[]>([]);
  const [nodes, setNodes] = useState(new Map<string, NodeData>());
  const [links, setLinks] = useState<LinkData[]>([]);
  const [simulation, setSimulation] = useState<d3.Simulation<NodeData, LinkData> | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [constantModalOpen, setConstantModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [selectedConstant, setSelectedConstant] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);

  const width = 800;
  const height = 600;

  const color = d3.scaleOrdinal()
    .domain(['predicate', 'entity'])
    .range(['#4F46E5', '#5B21B6']);

  const filterData = (data: FactItem[]) => {
    return data;
  };

  const buildGraph = async () => {
    try {
      // ✅ 수정: 새로운 API 형식으로 변경
      const data = await fetch('/api?endpoint=facts').then(res => {
        if (!res.ok) {
          throw new Error(`HTTP 오류 발생! 상태 코드: ${res.status}`);
        }
        return res.json();
      });

      const constants = await fetch('/api?endpoint=constants').then(res => res.json());
      setConstantsData(constants);

      const filteredData = filterData(data);
      console.log('📊 Building graph with data:', filteredData);

      const newNodes = new Map<string, NodeData>();
      const newLinks: LinkData[] = [];

      const constantCount = new Map<string, number>();

      filteredData.forEach((item: FactItem) => {
        item.constants.forEach(constant => {
          if (constant !== 'x' && constant !== 'y' && constant !== 'u' && constant !== 'm' && constant !== 's') {
            constantCount.set(constant, (constantCount.get(constant) || 0) + 1);
          }
        });
      });

      constantCount.forEach((count, constant) => {
        newNodes.set(constant, {
          id: constant,
          name: constant,
          type: 'constant',
          count: count,
          group: 1
        });
      });

      const linkMap = new Map<string, LinkData>();

      filteredData.forEach((item: FactItem) => {
        const validConstants = item.constants.filter(c => 
          c !== 'x' && c !== 'y' && c !== 'u' && c !== 'm' && c !== 's'
        );

        if (validConstants.length >= 2) {
          const sourceConstant = validConstants[0];
          for (let i = 1; i < validConstants.length; i++) {
            const targetConstant = validConstants[i];
            const linkKey = [sourceConstant, targetConstant].sort().join('-');

            if (!linkMap.has(linkKey)) {
              linkMap.set(linkKey, {
                source: sourceConstant,
                target: targetConstant,
                predicates: [],
                descriptions: [],
                values: [],
                count: 0
              });
            }

            const link = linkMap.get(linkKey)!;
            link.predicates.push(item.predicates[0] || 'unknown');
            link.descriptions.push(item.description || '');
            link.values.push(item.value || '');
            link.count++;
          }
        }
      });

      const finalLinks = Array.from(linkMap.values());

      setNodes(newNodes);
      setLinks(finalLinks);
      setNodeCount(newNodes.size);
      setLinkCount(finalLinks.length);

      return { nodes: newNodes, links: finalLinks };
    } catch (err) {
      console.error('데이터 가져오기 실패:', err);
      return null;
    }
  };

  const createGraph = async () => {
    const graphData = await buildGraph();
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodeArray = Array.from(graphData.nodes.values());

    console.log('노드 배열:', nodeArray);
    console.log('링크 배열:', graphData.links);

    const maxCount = Math.max(...nodeArray.map(n => n.count));
    const radiusScale = d3.scaleLinear()
      .domain([1, maxCount])
      .range([15, 30]);

    const newSimulation = d3.forceSimulation(nodeArray)
      .force("link", d3.forceLink(graphData.links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => radiusScale(d.count) + 10));

    setSimulation(newSimulation);

    const maxLinkCount = Math.max(...graphData.links.map(l => l.count));
    const strokeWidthScale = d3.scaleLinear()
      .domain([1, maxLinkCount])
      .range([1.5, 8]);
    
    const link = svg.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("class", styles.link)
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: LinkData) => strokeWidthScale(d.count))
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        setSelectedLink(d);
        setLinkModalOpen(true);
      });

    const linkLabel = svg.append("g")
      .selectAll("text")
      .data(graphData.links)
      .enter().append("text")
      .attr("class", styles["link-label"])
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .text((d: LinkData) => d.count > 1 ? `${d.count} relations` : d.predicates[0])
      .style("opacity", showLabels ? 1 : 0)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        setSelectedLink(d);
        setLinkModalOpen(true);
      });
    const node = svg.append("g")
      .selectAll("g")
      .data(nodeArray)
      .enter().append("g")
      .attr("class", styles.node)
      .call(d3.drag<any, NodeData>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", function(event, d) {
        setSelectedConstant(d.name);
        setConstantModalOpen(true);
      });

    node.append("circle")
      .attr("r", (d: NodeData) => radiusScale(d.count))
      .attr("fill", (d: NodeData) => color(d.type) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    const nodeText = node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "12px")
      .attr("fill", "#333")
      .text((d: NodeData) => d.name)
      .style("opacity", showLabels ? 1 : 0)
      .on("click", function(event, d) {
        setSelectedConstant(d.name);
        setConstantModalOpen(true);
      });

    newSimulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr("transform", (d: NodeData) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: NodeData) {
      if (!event.active) newSimulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: NodeData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: NodeData) {
      if (!event.active) newSimulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const toggleLabels = () => {
    setShowLabels(!showLabels);
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".link-label").style("opacity", !showLabels ? 1 : 0);
      svg.selectAll("text").style("opacity", !showLabels ? 1 : 0);
    }
  };

  const buildNewGraph = async () => {
    try {
      // ✅ 수정: 새로운 API 형식으로 변경
      await fetch('/api?endpoint=facts', { method: 'DELETE' });
      await fetch('/api?endpoint=constants', { method: 'DELETE' });
      await fetch('/api?endpoint=predicates', { method: 'DELETE' });

      const response = await fetch('/api?endpoint=memoriesDocument', { method: 'GET' });
      const document = await response.text();

      console.log('📄 Document to build:', document);

      await fetch('/api?endpoint=buildFols', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ document }) 
      });

      createGraph();
      console.log('📊 New graph built successfully!');
    } catch (error) {
      console.error('Error building new graph:', error);
    }
  };

  const centerGraph = () => {
    if (simulation) {
      simulation.alpha(0.3).restart();
    }
  };

  // 상수 검색 함수
  const getSelectedConstantData = () => {
    if (!selectedConstant) return null;
    
    // constantsData에서 value 필드가 selectedConstant와 일치하는 항목 찾기
    const matchedConstant = constantsData.find(c => c.value === selectedConstant);
    
    if (matchedConstant) {
      return {
        name: matchedConstant.name || matchedConstant.value, // name 필드 (또는 value를 fallback으로)
        description: matchedConstant.description || '설명이 없습니다.' // description 필드
      };
    }
    
    return null;
  };

  useEffect(() => {
    createGraph();
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".link-label").style("opacity", showLabels ? 1 : 0);
      svg.selectAll("text").style("opacity", showLabels ? 1 : 0);
    }
  }, [showLabels]);

  return (
    <>
      <Sidebar />
      <main className={styles['main-content']}>
        <div className={styles['graph-wrapper']}>
          <header className={styles.header}>
            <div className={styles['header-left']}>
              <h1 className={styles['page-title']}>AIN MEM GRAPH</h1>
              <p className={styles['page-subtitle']}>Visualizing relationships between logical propositions</p>
            </div>
            <div className={styles['header-right']}>
              <button 
                className={`${styles.btn} ${styles['btn-secondary']}`}
                onClick={centerGraph}
              >
                <span>⟲</span> Restart
              </button>
              <button 
                className={`${styles.btn} ${styles['btn-secondary']}`}
                onClick={toggleLabels}
              >
                <span>🏷️</span> Labels
              </button>
              <button 
                className={`${styles.btn} ${styles['btn-secondary']}`}
                onClick={buildNewGraph}
              >
                <span>📊</span> Build
              </button>
              <button 
                className={`${styles.btn} ${styles['btn-primary']}`}
                onClick={centerGraph}
              >
                <span>⊙</span> Center
              </button>
            </div>
          </header>

          <div className={styles.filters}>
            <span className={styles['filter-label']}>Filters:</span>
            <div className={`${styles['filter-tag']} ${styles.active}`}>All</div>
            <div className={styles['filter-tag']}>Wan AI</div>
            <div className={styles['filter-tag']}>Artany AI</div>
            <div className={styles['filter-tag']}>Business</div>
          </div>

          <div className={styles.content}>
            <div className={styles['graph-container']}>
              <svg 
                ref={svgRef}
                id="graph" 
                width="100%" 
                height="100%"
              />
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles['stat-item']}>
              <span>Nodes:</span> <span className={styles['stat-value']}>{nodeCount}</span>
            </div>
            <div className={styles['stat-item']}>
              <span>Links:</span> <span className={styles['stat-value']}>{linkCount}</span>
            </div>
            <div className={styles.legend}>
              <div className={styles['legend-item']}>
                <div className={`${styles['legend-circle']} ${styles.constant}`}></div>
                <span>Constants</span>
              </div>
              <div className={styles['legend-item']}>
                <div className={`${styles['legend-circle']} ${styles.predicate}`}></div>
                <span>Predicates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Link Modal */}
        <LinkModal 
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          linkData={selectedLink}
        />
        {/* Constant Modal */}
        <ConstantModal 
          selectedConstantInfo={getSelectedConstantData()}
          isOpen={constantModalOpen}
          onClose={() => setConstantModalOpen(false)}
        />
      </main>
    </>
  );
}