import { createPenderAction } from '../lib/utils';

const promiseCreator = value => Promise.resolve(value);
const actionCreator = createPenderAction('ACTION_TYPE', promiseCreator);
const action = actionCreator('payload');

describe('createPenderAction', () => {
  it('creates valid actionCreator', () => {
    expect(action).toBeTruthy();
  });

  it('has valid promise as payload', () => {
    expect(action.payload.pend).resolves.toBe('payload');
  });

  it('has valid meta', () => {
    expect(action.meta).toBe('payload');
  });
});
