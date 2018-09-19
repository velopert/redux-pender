import { pender } from '../lib/utils';

describe('pender', () => {
  it('default handlers of pender is working properly', () => {
    const penderActionHandlers = pender({
      type: 'ACTION_TYPE',
    });

    expect(penderActionHandlers.ACTION_TYPE_PENDING(true)).toBe(true);
    expect(penderActionHandlers.ACTION_TYPE_SUCCESS(true)).toBe(true);
    expect(penderActionHandlers.ACTION_TYPE_FAILURE(true)).toBe(true);
  });

  it('customized handlers of pender is working properly', () => {
    const penderActionHandlers = pender({
      type: 'ACTION_TYPE',
      onPending: () => 'pending',
      onSuccess: () => 'success',
      onFailure: () => 'failure',
    });

    expect(penderActionHandlers.ACTION_TYPE_PENDING()).toBe('pending');
    expect(penderActionHandlers.ACTION_TYPE_SUCCESS()).toBe('success');
    expect(penderActionHandlers.ACTION_TYPE_FAILURE()).toBe('failure');
  });
});
