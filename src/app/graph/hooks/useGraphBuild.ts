import { useState, useCallback } from 'react';

export const useGraphBuild = (userName: string | null) => {
  const [isBuilding, setIsBuilding] = useState(false);

  const buildNewGraph = useCallback(async () => {
    setIsBuilding(true);
    try {
      if (!userName) {
        console.error('❌ userName is required for building graph');
        return { success: false, error: 'No userName' };
      }

      console.log('Building graph for user:', userName);

      const response = await fetch(`/api/users/${encodeURIComponent(userName)}/graph/build`, {
        method: 'POST'
      });
      const result = await response.json();

      if (!result.success) {
        console.error('❌ Build failed:', result.error);
        return result;
      }

      console.log('📊 Graph built successfully!', result);
      return result;
    } catch (error) {
      console.error('Error building new graph:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsBuilding(false);
    }
  }, [userName]);

  const fullBuildGraph = useCallback(async () => {
    setIsBuilding(true);
    try {
      if (!userName) {
        console.error('❌ userName is required for full rebuild');
        return { success: false, error: 'No userName' };
      }

      console.log('🔄 Full rebuild for user:', userName);

      const response = await fetch(`/api/users/${encodeURIComponent(userName)}/graph/full-build`, {
        method: 'POST'
      });
      const result = await response.json();

      if (!result.success) {
        console.error('❌ Full rebuild failed:', result.error);
        return result;
      }

      console.log('📊 Full rebuild completed!', result);
      return result;
    } catch (error) {
      console.error('Error in full rebuild:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsBuilding(false);
    }
  }, [userName]);

  return {
    isBuilding,
    buildNewGraph,
    fullBuildGraph,
  };
};
