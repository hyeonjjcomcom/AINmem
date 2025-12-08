// app/graph/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import LinkModal from '@/components/LinkModal';
import ConstantModal from '@/components/ConstantModal';
import ConfirmModal from '@/components/ConfirmModal';
import AuthOverlay from '@/components/AuthOverlay';

import GraphHeader from './_components/GraphHeader';
import GraphFilters from './_components/GraphFilters';
import GraphStats from './_components/GraphStats';
import LoadingOverlay from './_components/LoadingOverlay';

import { useAuth } from '@/contexts/AuthContext';
import { useGraphData } from './hooks/useGraphData';
import { useGraphVisualization } from './hooks/useGraphVisualization';
import { useGraphBuild } from './hooks/useGraphBuild';

import { FILTER_TAGS } from './constants';
import type { LinkData } from './types';
import styles from './GraphPage.module.css';

export default function GraphPage() {
  const { isLoggedIn, userName, isHydrated } = useAuth();

  // State
  const [currentFilter, setCurrentFilter] = useState<string>('All');
  const [showLabels, setShowLabels] = useState(true);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [constantModalOpen, setConstantModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [selectedConstant, setSelectedConstant] = useState<string | null>(null);
  const [showFullBuildConfirm, setShowFullBuildConfirm] = useState(false);

  // Custom hooks
  const {
    constantsData,
    nodeCount,
    linkCount,
    buildGraph,
  } = useGraphData(userName);

  const {
    isBuilding,
    buildNewGraph,
    fullBuildGraph,
  } = useGraphBuild(userName);

  const {
    svgRef,
    createGraph,
    centerGraph,
    updateLabelsVisibility,
  } = useGraphVisualization({
    showLabels,
    onLinkClick: (link) => {
      setSelectedLink(link);
      setLinkModalOpen(true);
    },
    onNodeClick: (nodeName) => {
      setSelectedConstant(nodeName);
      setConstantModalOpen(true);
    },
  });

  // Handlers
  const handleRestart = useCallback(async () => {
    const graphData = await buildGraph();
    createGraph(graphData);
  }, [buildGraph, createGraph]);

  const handleBuild = useCallback(async () => {
    const result = await buildNewGraph();
    if (result.success) {
      handleRestart();
    }
  }, [buildNewGraph, handleRestart]);

  const handleFullBuild = useCallback(async () => {
    setShowFullBuildConfirm(false);
    const result = await fullBuildGraph();
    if (result.success) {
      handleRestart();
    }
  }, [fullBuildGraph, handleRestart]);

  const handleToggleLabels = useCallback(() => {
    setShowLabels(prev => !prev);
  }, []);

  // Get selected constant data for modal
  const getSelectedConstantData = useCallback(() => {
    if (!selectedConstant) return null;

    const matchedConstant = constantsData.find(c => c.value === selectedConstant);

    if (matchedConstant) {
      return {
        name: matchedConstant.name || matchedConstant.value,
        description: matchedConstant.description || 'No description available.'
      };
    }

    return {
      name: selectedConstant,
      description: 'No description available.'
    };
  }, [selectedConstant, constantsData]);

  // Effects
  useEffect(() => {
    if (isHydrated && userName) {
      console.log('✅ Auth loaded, creating graph for user:', userName);
      const loadGraph = async () => {
        const graphData = await buildGraph();
        createGraph(graphData);
      };
      loadGraph();
    } else {
      console.log('⏳ Waiting for auth... isHydrated:', isHydrated, 'userName:', userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, userName]);

  useEffect(() => {
    updateLabelsVisibility(showLabels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLabels]);

  return (
    <>
      <Sidebar />
      <main className={styles['main-content']}>
        {isHydrated && !isLoggedIn && <AuthOverlay />}

        <div className={styles['graph-wrapper']}>
          <GraphHeader
            onRestart={handleRestart}
            onBuild={handleBuild}
            onFullBuild={() => setShowFullBuildConfirm(true)}
            onCenter={centerGraph}
            isBuilding={isBuilding}
          />

          <div className={styles.content}>
            <GraphFilters
              filterTags={FILTER_TAGS}
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              showLabels={showLabels}
              onToggleLabels={handleToggleLabels}
            />

            <div className={styles['graph-container']}>
              <svg
                ref={svgRef}
                id="graph"
                width="100%"
                height="100%"
              />
              <GraphStats nodeCount={nodeCount} linkCount={linkCount} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <LinkModal
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          linkData={selectedLink}
        />

        <ConstantModal
          selectedConstantInfo={getSelectedConstantData()}
          isOpen={constantModalOpen}
          onClose={() => setConstantModalOpen(false)}
        />

        <ConfirmModal
          isOpen={showFullBuildConfirm}
          title="Full Build Confirmation"
          message="This will delete all graph data and rebuild from scratch. Do you want to continue?"
          confirmText="Full Build"
          cancelText="Cancel"
          onConfirm={handleFullBuild}
          onCancel={() => setShowFullBuildConfirm(false)}
          danger
        />

        <LoadingOverlay isVisible={isBuilding} />
      </main>
    </>
  );
}
