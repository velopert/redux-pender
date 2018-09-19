import { penderize } from '../lib/utils';

describe('penderize', () => {
  const penderized = penderize('ACTION');
  it('has all three proper properties', () => {
    expect(penderized).toHaveProperty('PENDING', 'ACTION_PENDING');
    expect(penderized).toHaveProperty('SUCCESS', 'ACTION_SUCCESS');
    expect(penderized).toHaveProperty('FAILURE', 'ACTION_FAILURE');
  });
});
