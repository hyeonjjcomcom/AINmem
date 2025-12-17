import { useState, useCallback } from 'react';
import type { Memory } from '../types';

export const useMemoriesData = (userName: string | null, isLoggedIn: boolean) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMemories = useCallback(async () => {
    // 로그인되지 않은 경우 빈 배열 설정
    if (!isLoggedIn || !userName) {
      setMemories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userName)}/memories`);
      if (!response.ok) throw new Error('Failed to fetch memories');

      const data = await response.json();
      const transformedData: Memory[] = data.map((item: any) => {
        let parsedContent = '';
        let inputText = '';

        if (item.content) {
          try {
            const parsed = JSON.parse(item.content);
            inputText = parsed.input_text || '';
            parsedContent = inputText;
          } catch {
            parsedContent = item.content;
          }
        }

        return {
          id: item.id,
          title: item.title,
          input_text: inputText || parsedContent,
          content: parsedContent,
          createdAt: item.createdAt,
          tags: item.tags || [],
          category: item.category || 'notes',
          session_id: item.session_id,
          model_version: item.model_version,
          tokens_input: item.tokens_input,
          user_id: item.user_id
        };
      });

      setMemories(transformedData);
    } catch (error) {
      console.error('Error fetching memories:', error);
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  }, [userName, isLoggedIn]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    if (!userName) {
      throw new Error('User not logged in');
    }

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userName)}/memories/${encodeURIComponent(memoryId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete memory');
      }

      // 삭제 성공 후 메모리 목록 새로고침
      await fetchMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }, [userName, fetchMemories]);

  return {
    memories,
    isLoading,
    fetchMemories,
    deleteMemory,
  };
};
