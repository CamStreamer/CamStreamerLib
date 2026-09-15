import { IWsClient } from '../internal/types';
import { PlaneTrackerEvents } from './PlaneTrackerEvents';
import { USER_PRIORITY_MAX, USER_PRIORITY_MIN } from '../types/ws/PlaneTrackerEvents';

const createWsClient = () =>
    ({
        send: jest.fn(),
        onOpen: undefined,
        onMessage: undefined,
    } as unknown as IWsClient & { send: jest.Mock; onOpen: () => void });

const VALID_USER = { userId: 'asd', userName: 'Asd', userPriority: 1 };

describe('PlaneTrackerEvents', () => {
    it.each([0, -1, USER_PRIORITY_MAX + 1, 1.5])('rejects userPriority %p', (userPriority) => {
        expect(() => new PlaneTrackerEvents(createWsClient(), { ...VALID_USER, userPriority })).toThrow(
            /userPriority must be an integer/
        );
    });

    it.each([USER_PRIORITY_MIN, USER_PRIORITY_MAX])('accepts userPriority %p', (userPriority) => {
        expect(() => new PlaneTrackerEvents(createWsClient(), { ...VALID_USER, userPriority })).not.toThrow();
    });

    it('rejects an empty userId', () => {
        expect(() => new PlaneTrackerEvents(createWsClient(), { ...VALID_USER, userId: '' })).toThrow();
    });

    it('sends USER_INFO once the socket opens', () => {
        const ws = createWsClient();
        new PlaneTrackerEvents(ws, VALID_USER);

        ws.onOpen();

        expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ type: 'USER_INFO', ...VALID_USER }));
    });
});
