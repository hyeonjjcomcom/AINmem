import { useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { NodeData, LinkData, GraphData } from '../types';
import { D3_CONFIG } from '../constants';
import styles from '../GraphPage.module.css';

interface UseGraphVisualizationProps {
  showLabels: boolean;
  onLinkClick: (link: LinkData) => void;
  onNodeClick: (nodeName: string) => void;
}

export const useGraphVisualization = ({
  showLabels,
  onLinkClick,
  onNodeClick,
}: UseGraphVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<NodeData, LinkData> | null>(null);

  const createGraph = useCallback(async (graphData: GraphData | null) => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.clientWidth || D3_CONFIG.MIN_WIDTH;
    const width = Math.max(containerWidth, D3_CONFIG.MIN_WIDTH);
    const height = D3_CONFIG.HEIGHT;

    const nodeArray = Array.from(graphData.nodes.values());

    console.log('노드 배열:', nodeArray);
    console.log('링크 배열:', graphData.links);

    const maxCount = Math.max(...nodeArray.map(n => n.count));
    const minCount = Math.min(...nodeArray.map(n => n.count));

    // 로그 스케일 사용: 많이 등장한 상수에 집중
    const radiusScale = d3.scaleSqrt()
      .domain([minCount, maxCount])
      .range([D3_CONFIG.NODE_RADIUS.MIN, D3_CONFIG.NODE_RADIUS.MAX]);

    // count 기반 색상 그라데이션
    const colorScale = d3.scaleLinear<string>()
      .domain([minCount, maxCount])
      .range([D3_CONFIG.NODE_COLORS.MIN, D3_CONFIG.NODE_COLORS.MAX]);

    const newSimulation = d3.forceSimulation(nodeArray)
      .force("link", d3.forceLink(graphData.links).id((d: any) => d.id).distance(D3_CONFIG.FORCES.LINK_DISTANCE))
      .force("charge", d3.forceManyBody().strength(D3_CONFIG.FORCES.CHARGE_STRENGTH))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => radiusScale(d.count) + D3_CONFIG.FORCES.COLLISION_RADIUS_PADDING));

    setSimulation(newSimulation);

    // ✅ Zoom/Pan 기능 추가
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([D3_CONFIG.ZOOM.MIN_SCALE, D3_CONFIG.ZOOM.MAX_SCALE])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // 링크 두께 스케일 (count 기반)
    const maxLinkCount = Math.max(...graphData.links.map(l => l.count), 1);
    const minLinkCount = Math.min(...graphData.links.map(l => l.count), 1);

    console.log('Link count range:', { minLinkCount, maxLinkCount });
    console.log('Sample links with counts:', graphData.links.slice(0, 5).map(l => ({
      source: typeof l.source === 'string' ? l.source : l.source.id,
      target: typeof l.target === 'string' ? l.target : l.target.id,
      count: l.count
    })));

    const linkWidthScale = d3.scaleLinear()
      .domain([minLinkCount, maxLinkCount])
      .range([3, 12]); // 최소 3px, 최대 12px

    // Links - 실제 보이는 선
    const link = g.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("class", styles.link)
      .style("stroke-width", (d: LinkData) => {
        const width = linkWidthScale(d.count);
        return `${width}px`;
      })
      .style("pointer-events", "none");

    // Links - 투명한 클릭 영역 (두꺼운 선)
    const linkHitArea = g.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("stroke", "transparent")
      .attr("stroke-width", 14)
      .style("cursor", "pointer")
      .on("click", function(_, d) {
        onLinkClick(d);
      })
      .on("mouseenter", function(_, d) {
        const index = graphData.links.indexOf(d);
        d3.select(link.nodes()[index])
          .style("stroke", "#6366f1")
          .style("opacity", "0.8");
      })
      .on("mouseleave", function(_, d) {
        const index = graphData.links.indexOf(d);
        d3.select(link.nodes()[index])
          .style("stroke", null)
          .style("opacity", null);
      });

    // Link labels
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(graphData.links)
      .enter().append("text")
      .attr("class", styles.linkLabel)
      .text((d: LinkData) => d.count > 1 ? `${d.count} relations` : d.predicates[0])
      .style("opacity", showLabels ? 1 : 0)
      .style("cursor", "pointer")
      .on("click", function(_, d) {
        onLinkClick(d);
      });

    // Drag handlers
    function dragstarted(event: any, d: NodeData) {
      if (!event.active) newSimulation.alphaTarget(D3_CONFIG.DRAG.ALPHA_TARGET).restart();
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

    // Nodes
    const medianCount = (minCount + maxCount) / 2;

    const node = g.append("g")
      .selectAll("g")
      .data(nodeArray)
      .enter().append("g")
      .attr("class", (d: NodeData) => {
        const isLarge = d.count >= medianCount;
        return `${styles.node} ${isLarge ? styles.large : styles.small}`;
      })
      .call(d3.drag<any, NodeData>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", function(_, d) {
        onNodeClick(d.name);
      });

    node.append("circle")
      .attr("r", (d: NodeData) => radiusScale(d.count))
      .attr("fill", (d: NodeData) => colorScale(d.count));

    node.append("text")
      .attr("dy", (d: NodeData) => {
        const isLarge = d.count >= medianCount;
        if (isLarge) {
          return ".35em"; // 큰 노드: 중앙
        } else {
          return `${radiusScale(d.count) + 12}px`; // 작은 노드: 아래
        }
      })
      .text((d: NodeData) => d.name)
      .style("opacity", showLabels ? 1 : 0)
      .on("click", function(_, d) {
        onNodeClick(d.name);
      });

    // Tick handler
    newSimulation.on("tick", () => {
      linkHitArea
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

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
  }, [showLabels, onLinkClick, onNodeClick]);

  const centerGraph = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);

      const width = svgRef.current.clientWidth || D3_CONFIG.MIN_WIDTH;
      const height = D3_CONFIG.HEIGHT;
      const cx = width / 2;
      const cy = height / 2;
      const scale = D3_CONFIG.CENTER_ANIMATION.SCALE;

      const zoomIn = d3.zoomIdentity
        .translate((1 - scale) * cx, (1 - scale) * cy)
        .scale(scale);

      svg.transition()
        .duration(D3_CONFIG.CENTER_ANIMATION.DURATION)
        .call(zoomRef.current.transform, zoomIn)
        .transition()
        .duration(D3_CONFIG.CENTER_ANIMATION.DURATION)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  const updateLabelsVisibility = useCallback((visible: boolean) => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".link-label").style("opacity", visible ? 1 : 0);
      svg.selectAll("text").style("opacity", visible ? 1 : 0);
    }
  }, []);

  return {
    svgRef,
    zoomRef,
    simulation,
    createGraph,
    centerGraph,
    updateLabelsVisibility,
  };
};
