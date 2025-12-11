import { useState, useCallback } from 'react';
import type { ConstantData, NodeData, LinkData, FactItem, GraphData } from '../types';
import { filterValidConstants } from '../utils';

export const useGraphData = (userName: string | null) => {
  const [constantsData, setConstantsData] = useState<ConstantData[]>([]);
  const [nodes, setNodes] = useState(new Map<string, NodeData>());
  const [links, setLinks] = useState<LinkData[]>([]);
  const [nodeCount, setNodeCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);

  const buildGraph = useCallback(async (): Promise<GraphData | null> => {
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

      console.log('📊 Building graph with data:', data);

      const newNodes = new Map<string, NodeData>();
      const newLinks: LinkData[] = [];

      const constantCount = new Map<string, number>();

      // Count occurrences of each constant
      data.forEach((item: FactItem) => {
        const validConstants = filterValidConstants(item.constants);
        validConstants.forEach(constant => {
          constantCount.set(constant, (constantCount.get(constant) || 0) + 1);
        });
      });

      // Create nodes from constants
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

      // Create links between constants
      data.forEach((item: FactItem) => {
        const validConstants = filterValidConstants(item.constants);

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
  }, [userName]);

  return {
    constantsData,
    nodes,
    links,
    nodeCount,
    linkCount,
    buildGraph,
  };
};
