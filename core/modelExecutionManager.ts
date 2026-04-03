import { convertCodebase } from '../services/llmService';
import type { Language, ConvertedFile, LLMProviderConfig, ModelResult } from '../types';

const MAX_PARALLEL_MODELS = 3;

export interface ExecutionConfig {
  providerId: string;
  providerName: string;
  baseUrl: string;
  apiKey: string;
  files: File[];
  sourceLanguage: Language;
  targetLanguage: Language;
}

export type ModelUpdateCallback = (model: string, update: ModelResult) => void;

/**
 * Run code conversion across multiple models with bounded concurrency.
 *
 * At most MAX_PARALLEL_MODELS conversions execute simultaneously.
 * Each model receives an independent call to convertCodebase and
 * failures in one model do not affect others.
 */
export async function executeModels(
  models: string[],
  config: ExecutionConfig,
  onUpdate: ModelUpdateCallback,
): Promise<ModelResult[]> {
  if (models.length === 0) return [];

  const resultMap = new Map<string, ModelResult>();

  for (const model of models) {
    const initial: ModelResult = { model, status: 'pending', files: null, error: null };
    resultMap.set(model, initial);
    onUpdate(model, initial);
  }

  const queue = [...models];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const model = queue.shift();
      if (!model) return;

      const processing: ModelResult = { model, status: 'processing', files: null, error: null };
      resultMap.set(model, processing);
      onUpdate(model, processing);

      try {
        const providerConfig: LLMProviderConfig = {
          id: config.providerId,
          name: config.providerName,
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
          model,
        };

        const files: ConvertedFile[] = await convertCodebase(
          config.files,
          config.sourceLanguage,
          config.targetLanguage,
          providerConfig,
        );

        const success: ModelResult = { model, status: 'success', files, error: null };
        resultMap.set(model, success);
        onUpdate(model, success);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Conversion failed for', model + ':', errorMsg);

        const failure: ModelResult = { model, status: 'error', files: null, error: errorMsg };
        resultMap.set(model, failure);
        onUpdate(model, failure);
      }
    }
  }

  const workerCount = Math.min(MAX_PARALLEL_MODELS, models.length);
  await Promise.allSettled(
    Array.from({ length: workerCount }, () => worker()),
  );

  return models.map(m => resultMap.get(m)!);
}
