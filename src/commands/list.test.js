import { jest } from '@jest/globals';
import { registerListCommand } from './list.js';

describe('registerListCommand', () => {
  let program;
  let mockCommand;
  let mockAction;

  beforeEach(() => {
    mockAction = jest.fn();
    mockCommand = {
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn().mockImplementation((fn) => {
        mockAction = fn;
        return mockCommand;
      }),
    };
    program = {
      command: jest.fn().mockReturnValue(mockCommand),
    };
  });

  it('registers the list command on the program', () => {
    registerListCommand(program);
    expect(program.command).toHaveBeenCalledWith('list');
  });

  it('sets a description on the command', () => {
    registerListCommand(program);
    expect(mockCommand.description).toHaveBeenCalled();
  });

  it('registers --json option', () => {
    registerListCommand(program);
    const optionCalls = mockCommand.option.mock.calls.map((c) => c[0]);
    expect(optionCalls.some((o) => o.includes('json'))).toBe(true);
  });

  it('calls action with a function', () => {
    registerListCommand(program);
    expect(mockCommand.action).toHaveBeenCalledWith(expect.any(Function));
  });

  it('action calls listSnapshots and prints output', async () => {
    const mockListSnapshots = jest.fn().mockResolvedValue([
      { name: 'snap1', createdAt: new Date('2024-01-01'), vars: { FOO: 'bar' } },
    ]);
    const mockFormatList = jest.fn().mockReturnValue('snap1  2024-01-01  1 vars');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    registerListCommand(program, {
      listSnapshots: mockListSnapshots,
      formatList: mockFormatList,
    });

    await mockAction({ json: false });

    expect(mockListSnapshots).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
