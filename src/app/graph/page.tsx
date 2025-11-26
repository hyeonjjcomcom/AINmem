// app/page.tsx
"use client";  

import Sidebar from '@/components/Sidebar';
import styles from './GraphPage.module.css';
import LinkModal from '@/components/LinkModal';
import ConstantModal from '@/components/ConstantModal';
import ConfirmModal from '@/components/ConfirmModal';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import AuthOverlay from '@/components/AuthOverlay';

import { useAuth } from '@/contexts/AuthContext';

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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
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
  const [isBuilding, setIsBuilding] = useState(false);
  const [showFullBuildConfirm, setShowFullBuildConfirm] = useState(false);
  const { isLoggedIn, userName, isHydrated } = useAuth();

  const color = d3.scaleOrdinal()
    .domain(['predicate', 'entity'])
    .range(['#4F46E5', '#5B21B6']);

  const filterData = (data: FactItem[]) => {
    return data;
  };

  const buildGraph = async () => {
    try {
      // ⚠️ userName이 없으면 API 호출하지 않음 (보안)
      if (!userName) {
        console.warn('⚠️ No userName available. Skipping graph build.');
        return null;
      }

      console.log('🔍 Current userName:', userName);
      console.log('🔍 API URL for facts:', `/api/users/${userName}/facts`);
      console.log('🔍 API URL for constants:', `/api/users/${userName}/constants`);

      // ✅ RESTful API 호출: /api/users/[userId]/facts
      const data = await fetch(`/api/users/${encodeURIComponent(userName)}/facts`).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status code: ${res.status}`);
        }
        return res.json();
      });

      console.log('📥 Received facts data:', data.length, 'items');

      const constants = await fetch(`/api/users/${encodeURIComponent(userName)}/constants`).then(res => res.json());
      console.log('📥 Received constants data:', constants.length, 'items');
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

    const containerWidth = svgRef.current.clientWidth || 800;
    const width = Math.max(containerWidth, 800);
    const height = 600;

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

    // ✅ Zoom/Pan 기능 추가
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const maxLinkCount = Math.max(...graphData.links.map(l => l.count));
    const strokeWidthScale = d3.scaleLinear()
      .domain([1, maxLinkCount])
      .range([1.5, 8]);

    const link = g.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("class", styles.link)
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: LinkData) => strokeWidthScale(d.count))
      .style("cursor", "pointer")
      .each(function(d) {
          // CSS 변수 설정하고 클래스 추가
          this.style.setProperty('--dynamic-stroke-width', strokeWidthScale(d.count) + 'px');
          d3.select(this).classed('dynamic-width', true);
      })
      .on("click", function(event, d) {
        setSelectedLink(d);
        setLinkModalOpen(true);
      });

    const linkLabel = g.append("g")
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
    const node = g.append("g")
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
    setIsBuilding(true); // 빌드 시작
    try {
      const user_id = userName;

      if (!user_id) {
        console.error('❌ user_id is required for building graph');
        return;
      }

      console.log('Building graph for user_id:', user_id);

      // ✅ Incremental build: buildAt이 없는 메모리만 가져옴
      const response = await fetch(`/api?endpoint=memoriesDocument&user_id=${user_id}`, { method: 'GET' });
      const document = await response.text();

      // 빌드할 새로운 메모리가 없으면 스킵
      if (!document || document.trim() === '') {
        console.log('📊 No new memories to build');
        createGraph();
        return;
      }

      console.log('📄 Document to build:', document);
      const temp = JSON.stringify({ document, user_id });
      console.log('📄 Payload being sent:', temp);

      await fetch('/api?endpoint=buildFols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: temp
      });

      createGraph();
      console.log('📊 New graph built successfully!');
    } catch (error) {
      console.error('Error building new graph:', error);
    } finally {
      setIsBuilding(false); // 빌드 완료 (성공/실패 상관없이)
    }
  };

  // Full Rebuild: 모든 FOL 데이터 삭제 후 전체 메모리 재빌드
  const fullBuildGraph = async () => {
    setShowFullBuildConfirm(false);
    setIsBuilding(true);
    try {
      const user_id = userName;

      if (!user_id) {
        console.error('❌ user_id is required for building graph');
        return;
      }

      console.log('🔄 Full rebuild for user_id:', user_id);

      // 기존 FOL 데이터 삭제
      await fetch(`/api/users/${encodeURIComponent(user_id)}/facts`, { method: 'DELETE' });
      await fetch(`/api/users/${encodeURIComponent(user_id)}/constants`, { method: 'DELETE' });
      await fetch(`/api/users/${encodeURIComponent(user_id)}/predicates`, { method: 'DELETE' });

      // 모든 메모리의 buildAt 초기화
      await fetch(`/api/users/${encodeURIComponent(user_id)}/memories/resetBuildAt`, { method: 'POST' });

      // 전체 메모리 가져오기 (buildAt 초기화 후이므로 모든 메모리 반환)
      const response = await fetch(`/api?endpoint=memoriesDocument&user_id=${user_id}`, { method: 'GET' });
      const document = await response.text();

      if (!document || document.trim() === '') {
        console.log('📊 No memories to build');
        createGraph();
        return;
      }

      console.log('📄 Full document to build:', document);
      const temp = JSON.stringify({ document, user_id });

      await fetch('/api?endpoint=buildFols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: temp
      });

      createGraph();
      console.log('📊 Full rebuild completed!');
    } catch (error) {
      console.error('Error in full rebuild:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  const centerGraph = () => {
    // Zoom을 초기 상태로 리셋
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }

    // 시뮬레이션도 재시작
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
        description: matchedConstant.description || 'No description available.' // description 필드
      };
    }
    
    return null;
  };

  useEffect(() => {
    // isHydrated가 true이고 userName이 있을 때만 그래프 생성
    if (isHydrated && userName) {
      console.log('✅ Auth loaded, creating graph for user:', userName);
      createGraph();
    } else {
      console.log('⏳ Waiting for auth... isHydrated:', isHydrated, 'userName:', userName);
    }
  }, [isHydrated, userName]);

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
        {isHydrated && !isLoggedIn && (
          <AuthOverlay />
        )}
        <div className={styles['graph-wrapper']}>
          <header className={styles.header}>
            <div className={styles['header-left']}>
              <h1 className={styles['page-title']}>AIN MEM GRAPH</h1>
              <p className={styles['page-subtitle']}>Visualizing relationships between logical propositions</p>
            </div>
            <div className={styles['header-right']}>
              <button
                className={`${styles.btn} ${styles['btn-secondary']}`}
                onClick={createGraph}
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
                className={`${styles.btn} ${styles['btn-secondary']}`}
                onClick={() => setShowFullBuildConfirm(true)}
              >
                <span>🔄</span> Full Build
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
            <div className={styles['filter-tag']}>Life</div>
            <div className={styles['filter-tag']}>Work</div>
            <div className={styles['filter-tag']}>Note</div>
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
        {/* Full Build Confirm Modal */}
        <ConfirmModal
          isOpen={showFullBuildConfirm}
          title="Full Build Confirmation"
          message="This will delete all graph data and rebuild from scratch. Do you want to continue?"
          confirmText="Full Build"
          cancelText="Cancel"
          onConfirm={fullBuildGraph}
          onCancel={() => setShowFullBuildConfirm(false)}
          danger
        />

        {/* 로딩 오버레이 추가 */}
        {isBuilding && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>🔄</div>
              <div>Building Graph...</div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}