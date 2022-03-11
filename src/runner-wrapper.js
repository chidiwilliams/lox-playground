import { Runner } from '@chidiwilliams/loxjs';

export const LogTypes = {
  Stdout: 'stdout',
  Stderr: 'stderr',
  Return: 'return',
};

export class RunnerWrapper {
  logs = [];

  stdOut = {
    writeLn: (line) => {
      this.logs.push({ type: LogTypes.Stdout, content: line });
    },
  };

  stdErr = {
    writeLn: (line) => {
      this.logs.push({ type: LogTypes.Stderr, content: line });
    },
  };

  runner = new Runner(this.stdOut, this.stdErr);

  run(source) {
    this.logs = [];
    const result = this.runner.run(source);
    if (this.logs.length === 0 || this.logs[this.logs.length - 1].type !== LogTypes.Stderr) {
      this.logs.push({ type: LogTypes.Return, content: result === undefined ? '<nil>' : result }); // TODO: update lib
    }
  }
}
