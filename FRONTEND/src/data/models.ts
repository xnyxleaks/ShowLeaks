import { modelsApi } from '../services/api';
import type { Model } from '../types';

export const getModels = async (): Promise<Model[]> => {
  try {
    const response = await modelsApi.getAll({ limit: 100 });
    return response.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};