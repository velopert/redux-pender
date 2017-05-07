import createPenderAction from '../src/create-pender-action';

const promiseCreator = (value) => Promise.resolve(value);
const actionCreator = createPenderAction('ACTION_TYPE', promiseCreator);
const action = actionCreator('payload', 'meta');
const anotherAction = actionCreator('payload', { object: true })

test('creates valid actionCreator', () => {
    expect(action).toBeTruthy();
});

test('has valid promise as payload', () => {
    expect(action.payload.pend).resolves.toBe('payload');
})

test('has valid meta', () => {
    expect(action.meta._payload).toBe('payload');
    expect(action.meta.value).toBe('meta');
})

test('has valid meta when it is an object', () => {
    expect(anotherAction.meta.object).toBe(true);
})

