import { Runner } from '@chidiwilliams/loxjs';

export const LogTypes = {
  Stdout: 'stdout',
  Stderr: 'stderr',
  Return: 'return',
};

let logs = [];

const runner = new Runner(
  {
    writeLn: (line) => {
      logs.push({ type: LogTypes.Stdout, content: line });
    },
  },
  {
    writeLn: (line) => {
      logs.push({ type: LogTypes.Stderr, content: line });
    },
  },
);

// Wrapper over the Lox runner that collects the logs of each run
export function run(source) {
  logs = [];
  const result = runner.run(source);
  logs.push({ type: LogTypes.Return, content: result });
  return logs;
}
