import penderize from '../src/penderize';

test('penderize', () => {
    expect(penderize('ACTION')).toHaveProperty('PENDING', 'ACTION_PENDING');
    expect(penderize('ACTION')).toHaveProperty('SUCCESS', 'ACTION_SUCCESS');
    expect(penderize('ACTION')).toHaveProperty('FAILURE', 'ACTION_FAILURE');
});