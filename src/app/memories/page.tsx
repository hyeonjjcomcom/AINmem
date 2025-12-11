"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MemoryDetailModal from '@/components/MemoryDetailModal';
import AuthOverlay from '@/components/AuthOverlay';

import MemoryHeader from './_components/MemoryHeader';
import MemoryFilters from './_components/MemoryFilters';
import MemoryGrid from './_components/MemoryGrid';
import EmptyState from './_components/EmptyState';

import { useAuth } from '@/contexts/AuthContext';
import { useMemoriesData } from './hooks/useMemoriesData';
import { useMemoriesFilter } from './hooks/useMemoriesFilter';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { FILTER_TAGS } from './constants';
import type { Memory } from './types';
import styles from './Memories.module.css';

const MemoriesPage = () => {
  const { isLoggedIn, userName, isHydrated } = useAuth();

  // State
  const [currentFilter, setCurrentFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Custom hooks
  const {
    memories,
    isLoading,
    fetchMemories,
    deleteMemory,
  } = useMemoriesData(userName, isLoggedIn);

  const { filteredMemories } = useMemoriesFilter(memories, searchTerm, currentFilter);

  useKeyboardShortcuts(() => setIsModalOpen(false));

  // Handlers
  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  const handleDelete = async (memoryId: string) => {
    try {
      await deleteMemory(memoryId);
      closeModal();
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  // Effects
  useEffect(() => {
    if (isLoggedIn && userName) {
      fetchMemories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userName]);

  return (
    <>
      <Sidebar />
      <main className={styles.mainContent}>
        {isHydrated && !isLoggedIn && <AuthOverlay />}

        <MemoryHeader
          filteredMemories={filteredMemories}
          handleRefresh={fetchMemories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className={styles.content}>
          <MemoryFilters
            filterTags={FILTER_TAGS}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />

          <EmptyState isLoading={isLoading} isEmpty={filteredMemories.length === 0} />

          <MemoryGrid
            memories={filteredMemories}
            onMemoryClick={handleMemoryClick}
          />
        </div>

        <MemoryDetailModal
          isOpen={isModalOpen}
          memory={selectedMemory}
          onClose={closeModal}
          onDelete={handleDelete}
        />
      </main>
    </>
  );
};

export default MemoriesPage;
