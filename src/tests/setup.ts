import { afterEach, vi } from 'vitest';

import { prismaMock } from './mocks/prisma.mock';

afterEach(() => {
  vi.clearAllMocks();

  Object.values(prismaMock).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function') {
          method.mockReset();
        }
      });
    }
  });
});
