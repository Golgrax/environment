import { SystemEnvironment } from '@/classes/system/SystemEnvironment';
import { Platform } from '@/types/global';
import { WindowsRegistry } from '@/types/registry';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import * as os from 'node:os';

// Mock child_process and fs modules
jest.mock('node:child_process');
jest.mock('node:fs');
jest.mock('node:os');

describe('SystemEnvironment', () => {
  let systemEnvironment: SystemEnvironment;

  beforeEach(() => {
    jest.clearAllMocks();
    systemEnvironment = new SystemEnvironment(Platform.Linux);
    (existsSync as jest.Mock).mockReturnValue(true);
    (os.platform as jest.Mock).mockReturnValue('linux');
    (os.cpus as jest.Mock).mockReturnValue([{ model: 'mock_cpu', speed: 100 }]);
    (os.totalmem as jest.Mock).mockReturnValue(1024);
    (os.freemem as jest.Mock).mockReturnValue(512);
  });

  it('should return the value of a system environment variable for Linux', () => {
    (readFileSync as jest.Mock).mockReturnValue('MY_VAR="my_value"\n');
    const value = systemEnvironment.get('MY_VAR');
    expect(value).toBe('my_value');
  });

  it('should return the value of a system environment variable for Windows', () => {
    systemEnvironment.platform = Platform.Windows;
    (spawnSync as jest.Mock).mockReturnValue({
      status: 0,
      stdout: '\n    MY_VAR    REG_SZ    my_value\n',
    });
    const value = systemEnvironment.get('MY_VAR');
    expect(value).toBe('my_value');
  });

  it('should return undefined if the environment variable is not found', () => {
    (readFileSync as jest.Mock).mockReturnValue('OTHER_VAR="other_value"\n');
    const value = systemEnvironment.get('NON_EXISTENT_VAR');
    expect(value).toBeUndefined();
  });

  it('should return the default value if the environment variable is not found', () => {
    (readFileSync as jest.Mock).mockReturnValue('OTHER_VAR="other_value"\n');
    const value = systemEnvironment.get('NON_EXISTENT_VAR', { defaultValue: 'default' });
    expect(value).toBe('default');
  });

  it('should return the operating system', () => {
    const osName = systemEnvironment.getOS();
    expect(osName).toBe('linux');
  });

  it('should return the CPU information', () => {
    const cpu = systemEnvironment.getCPU();
    expect(cpu).toEqual({ model: 'mock_cpu', speed: 100 });
  });

  it('should return the memory information', () => {
    const memory = systemEnvironment.getMemory();
    expect(memory).toEqual({ total: 1024, free: 512 });
  });

  it('should set a system environment variable for Linux', () => {
    (readFileSync as jest.Mock).mockReturnValue('');
    const writeFileSync = jest.spyOn(require('node:fs'), 'writeFileSync');
    systemEnvironment.set('MY_VAR', 'my_value');
    expect(writeFileSync).toHaveBeenCalledWith('/etc/environment', 'MY_VAR="my_value"\n', 'utf-8');
  });

  it('should set a system environment variable for Windows', () => {
    systemEnvironment.platform = Platform.Windows;
    const spawnSync = jest.spyOn(require('node:child_process'), 'spawnSync');
    systemEnvironment.set('MY_VAR', 'my_value');
    expect(spawnSync).toHaveBeenCalledWith('reg', [
      'add',
      WindowsRegistry.HKLM,
      '/v',
      'MY_VAR',
      '/t',
      'REG_EXPAND_SZ',
      '/d',
      'my_value',
      '/f',
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      encoding: 'utf-8',
    });
  });

  it('should remove a system environment variable for Linux', () => {
    (readFileSync as jest.Mock).mockReturnValue('MY_VAR="my_value"\n');
    const writeFileSync = jest.spyOn(require('node:fs'), 'writeFileSync');
    systemEnvironment.remove('MY_VAR');
    expect(writeFileSync).toHaveBeenCalledWith('/etc/environment', '\n', 'utf-8');
  });

  it('should remove a system environment variable for Windows', () => {
    systemEnvironment.platform = Platform.Windows;
    const spawnSync = jest.spyOn(require('node:child_process'), 'spawnSync');
    systemEnvironment.remove('MY_VAR');
    expect(spawnSync).toHaveBeenCalledWith('reg', [
      'delete',
      WindowsRegistry.HKLM,
      '/v',
      'MY_VAR',
      '/f',
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });
  });

  it('should list the keys of system environment variables for Linux', () => {
    (readFileSync as jest.Mock).mockReturnValue('MY_VAR="my_value"\nANOTHER_VAR="another_value"\n');
    const keys = systemEnvironment.listKeys();
    expect(keys).toEqual(['MY_VAR', 'ANOTHER_VAR']);
  });

  it('should list the keys of system environment variables for Windows', () => {
    systemEnvironment.platform = Platform.Windows;
    (spawnSync as jest.Mock).mockReturnValue({
      status: 0,
      stdout: '\n    MY_VAR    REG_SZ    my_value\n    ANOTHER_VAR    REG_SZ    another_value\n',
    });
    const keys = systemEnvironment.listKeys();
    expect(keys).toEqual(['MY_VAR', 'ANOTHER_VAR']);
  });

  it('should list the values of system environment variables for Linux', () => {
    (readFileSync as jest.Mock).mockReturnValue('MY_VAR="my_value"\nANOTHER_VAR="another_value"\n');
    const values = systemEnvironment.listValues();
    expect(values).toEqual(['my_value', 'another_value']);
  });

  it('should list the values of system environment variables for Windows', () => {
    systemEnvironment.platform = Platform.Windows;
    (spawnSync as jest.Mock).mockReturnValue({
      status: 0,
      stdout: '\n    MY_VAR    REG_SZ    my_value\n    ANOTHER_VAR    REG_SZ    another_value\n',
    });
    const values = systemEnvironment.listValues();
    expect(values).toEqual(['my_value', 'another_value']);
  });
});
