export interface FullTrialsIndexEntry {
  file: string;
  totalTrials: number;
}

export const fullTrialsIndexByModel: Record<string, FullTrialsIndexEntry> = {
  "anthropic/claude-sonnet-4.5": {
    "file": "/data/full-trials/anthropic-claude-sonnet-4.5.json",
    "totalTrials": 196
  },
  "google/gemini-3-flash-preview": {
    "file": "/data/full-trials/google-gemini-3-flash-preview.json",
    "totalTrials": 200
  },
  "x-ai/grok-4.1-fast": {
    "file": "/data/full-trials/x-ai-grok-4.1-fast.json",
    "totalTrials": 186
  },
  "google/gemini-2.5-flash": {
    "file": "/data/full-trials/google-gemini-2.5-flash.json",
    "totalTrials": 192
  },
  "openai/gpt-oss-120b": {
    "file": "/data/full-trials/openai-gpt-oss-120b.json",
    "totalTrials": 206
  },
  "minimax/minimax-m2.1": {
    "file": "/data/full-trials/minimax-minimax-m2.1.json",
    "totalTrials": 198
  },
  "openai/gpt-5-nano": {
    "file": "/data/full-trials/openai-gpt-5-nano.json",
    "totalTrials": 200
  }
};
