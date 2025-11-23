// app/page.tsx
"use client";  

import Sidebar from '@/components/Sidebar';
import styles from './GraphPage.white.module.css';
import LinkModal from '@/components/LinkModal';
import ConstantModal from '@/components/ConstantModal';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

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
  const { isLoggedIn, userName } = useAuth();

  const color = d3.scaleOrdinal()
    .domain(['predicate', 'entity'])
    .range(['#a78bfa', '#c4b5fd']);

  const filterData = (data: FactItem[]) => {
    return data;
  };

  
  const buildGraph = async () => {
    try {
      // ✅ 수정: 새로운 API 형식으로 변경
      /*
      const data = await fetch('/api?endpoint=facts').then(res => {
        if (!res.ok) {
          throw new Error(`HTTP 오류 발생! 상태 코드: ${res.status}`);
        }
        return res.json();
      });
      */
      const data = [
        {
            "value": "훈련생(trainee_a)",
            "description": "A는 훈련생입니다.",
            "predicates": [ "훈련생" ],
            "constants": [ "훈련생 A" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "훈련과정(course_x)",
            "description": "X는 훈련과정입니다.",
            "predicates": [ "훈련과정" ],
            "constants": [ "훈련과정 X" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "아이피주소(ip_192_168_0_1)",
            "description": "192.168.0.1은 IP 주소입니다.",
            "predicates": [ "아이피주소" ],
            "constants": [ "ip_192_168_0_1" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "아이피주소(ip_192_168_0_2)",
            "description": "192.168.0.2는 IP 주소입니다.",
            "predicates": [ "아이피주소" ],
            "constants": [ "ip_192_168_0_2" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "수강한다(trainee_a, course_x)",
            "description": "훈련생 A는 훈련과정 X를 수강하고 있습니다.",
            "predicates": [ "수강한다" ],
            "constants": [ "훈련생 A", "훈련과정 X" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "로그인아이피(trainee_a, ip_192_168_0_1)",
            "description": "훈련생 A의 기록된 로그인 IP는 192.168.0.1입니다.",
            "predicates": [ "로그인아이피" ],
            "constants": [ "훈련생 A", "ip_192_168_0_1" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "학습아이피(trainee_a, ip_192_168_0_2)",
            "description": "훈련생 A의 실제 학습 IP는 192.168.0.2입니다.",
            "predicates": [ "학습아이피" ],
            "constants": [ "훈련생 A", "ip_192_168_0_2" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "위반이다(trainee_a, 데이터불일치위반)",
            "description": "결과적으로, 훈련생 A는 '데이터 불일치' 규정을 위반했습니다.",
            "predicates": [ "위반이다" ],
            "constants": [ "훈련생 A", "데이터불일치위반" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "탐지한다(AI model, 데이터불일치위반, trainee_a)",
            "description": "AI 모델이 훈련생 A의 '데이터 불일치' 위반을 탐지했습니다.",
            "predicates": [ "탐지한다" ],
            "constants": [ "AI model", "데이터불일치위반", "훈련생 A" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "∀x,y ((위반이다(x, 데이터불일치위반) ∧ 탐지한다(AI model, 데이터불일치위반, x)) → 신호부여(x, 부정훈련위험도상승신호))",
            "description": "모든 훈련생 x에 대해, 만약 AI 모델이 '데이터 불일치' 위반을 탐지하면, 해당 훈련생에게 '부정훈련 위험도 상승' 신호가 부여됩니다.",
            "predicates": [ "위반이다", "탐지한다", "신호부여" ],
            "constants": [
            "x",
            "데이터불일치위반",
            "AI model",
            "부정훈련위험도상승신호"
            ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "신호부여(trainee_a, 부정훈련위험도상승신호)",
            "description": "결과적으로, 훈련생 A에게 '부정훈련 위험도 상승' 신호가 부여되었습니다.",
            "predicates": [ "신호부여" ],
            "constants": [ "훈련생 A", "부정훈련위험도상승신호" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "훈련생(trainee_b)",
            "description": "B는 훈련생입니다.",
            "predicates": [ "훈련생" ],
            "constants": [ "훈련생 B" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "수강한다(trainee_a, course_x)",
            "description": "훈련생 B는 훈련과정 Y를 수강하고 있습니다.",
            "predicates": [ "수강한다" ],
            "constants": [ "훈련생 B", "훈련과정 Y" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "학습아이피(trainee_b, ip_192_168_0_2)",
            "description": "훈련생 B의 실제 학습 IP는 192.168.0.2입니다.",
            "predicates": [ "학습아이피" ],
            "constants": [ "훈련생 B", "ip_192_168_0_2" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        },
        {
            "value": "로그인아이피(trainee_b, ip_192_168_0_2)",
            "description": "훈련생 B의 기록된 로그인 IP는 192.168.0.1입니다.",
            "predicates": [ "로그인아이피" ],
            "constants": [ "훈련생 B", "ip_192_168_0_2" ],
            "updated_at": "2025-09-29T05:38:58.830Z"
        }
      ];


      /*const constants = await fetch('/api?endpoint=constants').then(res => res.json());
      setConstantsData(constants); */

      const constants = [
        { value: '훈련생 A', description: '훈련생 A를 나타내는 상수입니다.' },
        { value: '훈련과정 X', description: '훈련과정 X를 나타내는 상수입니다.' },
        {
          value: 'ip_192_168_0_1',
          description: 'IP 주소 192.168.0.1을 나타내는 상수입니다.'
        },
        {
          value: 'ip_192_168_0_2',
          description: 'IP 주소 192.168.0.2를 나타내는 상수입니다.'
        },
        {
          value: '데이터 불일치 규정 위반',
          description: "'데이터 불일치' 규정 위반 유형을 나타내는 상수입니다."
        },
        { value: 'AI 모델', description: '규정 위반을 탐지하는 AI 모델을 나타내는 상수입니다.' },
        {
          value: '부정훈련 위험도 상승',
          description: "'부정훈련 위험도 상승' 신호를 나타내는 상수입니다."
        },
        {
          value: 'x',
          description: 'Auto-extracted constant from fact: ∀x,y ((IsViolation(x, data_mismatch_violation) ∧ Detects(AI model, data_mismatch_violation, x)) → AssignsSignal(x, increased_fraud_risk_signal))'
        }
      ];
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
      .each(function(d) {
          // CSS 변수 설정하고 클래스 추가
          this.style.setProperty('--dynamic-stroke-width', strokeWidthScale(d.count) + 'px');
          d3.select(this).classed('dynamic-width', true);
      })
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
      .attr("font-size", "20px")
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
    setIsBuilding(true); // 빌드 시작
    try {
      const user_id = userName;
      console.log('Building graph for user_id:', user_id);

      await fetch('/api?endpoint=facts', { method: 'DELETE' });
      await fetch('/api?endpoint=constants', { method: 'DELETE' });
      await fetch('/api?endpoint=predicates', { method: 'DELETE' });

      const response = await fetch(`/api?endpoint=memoriesDocument&user_id=${user_id}`, { method: 'GET' });
      const document = await response.text();

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
            {/*
            <div className={styles['filter-tag']}>Wan AI</div>
            <div className={styles['filter-tag']}>Artany AI</div>
            <div className={styles['filter-tag']}>Business</div>
            */}
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
            {/*
              <div className={styles['legend-item']}>
                <div className={`${styles['legend-circle']} ${styles.constant}`}></div>
                <span>Constants</span>
              </div>
              <div className={styles['legend-item']}>
                <div className={`${styles['legend-circle']} ${styles.predicate}`}></div>
                <span>Predicates</span>
              </div>
            */}
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