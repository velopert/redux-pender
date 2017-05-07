import pender from '../src/pender';

test('default handlers of pender is working properly', () => {
    const penderActionHandlers = pender({
        type: 'ACTION_TYPE'
    })

    expect(penderActionHandlers['ACTION_TYPE_PENDING'](true)).toBe(true);
    expect(penderActionHandlers['ACTION_TYPE_SUCCESS'](true)).toBe(true);
    expect(penderActionHandlers['ACTION_TYPE_FAILURE'](true)).toBe(true);
})

test('customized handlers of pender is working properly', () => {
    const penderActionHandlers = pender({
        type: 'ACTION_TYPE',
        onPending: (state) => 'pending',
        onSuccess: (state) => 'success',
        onFailure: (state) => 'failure'
    })

    expect(penderActionHandlers['ACTION_TYPE_PENDING']()).toBe('pending');
    expect(penderActionHandlers['ACTION_TYPE_SUCCESS']()).toBe('success');
    expect(penderActionHandlers['ACTION_TYPE_FAILURE']()).toBe('failure');
})