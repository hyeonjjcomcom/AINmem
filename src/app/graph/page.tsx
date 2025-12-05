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
  const [currentFilter, setCurrentFilter] = useState<string>('All');
  const { isLoggedIn, userName, isHydrated } = useAuth();

  const filterTags = [
    { id: 'All', label: 'All' },
    { id: 'Exploration', label: 'Exploration' },
    { id: 'Inspiration', label: 'Inspiration' },
    { id: 'Refinement', label: 'Refinement' },
    { id: 'Solution', label: 'Solution' },
    { id: 'Empathy', label: 'Empathy' },
    { id: 'Play', label: 'Play' },
    { id: 'Others', label: 'Others' }
  ];

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
    const minCount = Math.min(...nodeArray.map(n => n.count));

    // 로그 스케일 사용: 많이 등장한 상수에 집중
    const radiusScale = d3.scaleSqrt()
      .domain([minCount, maxCount])
      .range([12, 35]);

    // count 기반 색상 그라데이션: 적게 등장 (중간 보라) → 많이 등장 (진한 보라)
    const colorScale = d3.scaleLinear<string>()
      .domain([minCount, maxCount])
      .range(['#8b5cf6', '#5B21B6']); // 중간 보라 → 진한 보라

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
      .attr("fill", (d: NodeData) => colorScale(d.count))
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
    setIsBuilding(true);
    try {
      if (!userName) {
        console.error('❌ userName is required for building graph');
        return;
      }

      console.log('Building graph for user:', userName);

      const response = await fetch(`/api/users/${encodeURIComponent(userName)}/graph/build`, {
        method: 'POST'
      });
      const result = await response.json();

      if (!result.success) {
        console.error('❌ Build failed:', result.error);
        return;
      }

      console.log('📊 Graph built successfully!', result);
      createGraph();
    } catch (error) {
      console.error('Error building new graph:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  // Full Rebuild: 모든 FOL 데이터 삭제 후 전체 메모리 재빌드
  const fullBuildGraph = async () => {
    setShowFullBuildConfirm(false);
    setIsBuilding(true);
    try {
      if (!userName) {
        console.error('❌ userName is required for full rebuild');
        return;
      }

      console.log('🔄 Full rebuild for user:', userName);

      const response = await fetch(`/api/users/${encodeURIComponent(userName)}/graph/full-build`, {
        method: 'POST'
      });
      const result = await response.json();

      if (!result.success) {
        console.error('❌ Full rebuild failed:', result.error);
        return;
      }

      console.log('📊 Full rebuild completed!', result);
      createGraph();
    } catch (error) {
      console.error('Error in full rebuild:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  const centerGraph = () => {
    // Zoom을 초기 상태로 리셋 + Breathing 효과
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);

      // SVG 중심점 계산
      const width = svgRef.current.clientWidth || 800;
      const height = 600;
      const cx = width / 2;
      const cy = height / 2;
      const scale = 1.03;

      // 중앙 기준으로 확대: translate((1-k) * cx, (1-k) * cy).scale(k)
      const zoomIn = d3.zoomIdentity
        .translate((1 - scale) * cx, (1 - scale) * cy)
        .scale(scale);

      // 살짝 확대했다가 원래대로 (시각적 피드백)
      svg.transition()
        .duration(200)
        .call(zoomRef.current.transform, zoomIn)
        .transition()
        .duration(200)
        .call(zoomRef.current.transform, d3.zoomIdentity);
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
    
    // DB에서 못 찾아도 선택된 상수 이름은 표시
    return {
      name: selectedConstant,
      description: 'No description available.'
    };
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
              <h1 className={styles['page-title']}>Knowledge Graph</h1>
              <p className={styles['page-subtitle']}>
                Navigate your knowledge graph and discover meaningful patterns
              </p>
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

          <div className={styles.content}>
            <div className={styles['filters-wrapper']}>
              <div className={styles.filters}>
                {filterTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`${styles['filter-tag']} ${currentFilter === tag.id ? styles['active'] : ''}`}
                    onClick={() => setCurrentFilter(tag.id)}
                  >
                    {tag.label}
                  </div>
                ))}
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
            <div className={styles['graph-container']}>
              <svg
                ref={svgRef}
                id="graph"
                width="100%"
                height="100%"
              />
              <div className={styles['graph-stats']}>
                <div className={styles['stat-item']}>
                  <span>Nodes:</span> <span className={styles['stat-value']}>{nodeCount}</span>
                </div>
                <div className={styles['stat-item']}>
                  <span>Links:</span> <span className={styles['stat-value']}>{linkCount}</span>
                </div>
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