import { Runner } from '@chidiwilliams/loxjs';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const LogTypes = {
  Stdout: 'stdout',
  Stderr: 'stderr',
  Return: 'return',
};

class RunnerWrapper {
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

function App() {
  const [input, setInput] = useState('');
  const [runner, setRunner] = useState(null);
  const [history, setHistory] = useState([]);
  const replInputLineRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setRunner(new RunnerWrapper());
  }, []);

  const onSubmitForm = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    runner.run(input);
    setHistory([...history, { input: input, logs: runner.logs }]);
    setInput('');
  };

  useEffect(() => {
    replInputLineRef.current.scrollIntoView();
  }, [history]);

  const onChangeInput = (inputText) => {
    setInput(inputText);
  };

  const onKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      if (input.trim().length > 0) {
        onSubmitForm();
      }
    }
  };

  const onClickRepl = () => {
    inputRef.current.focus();
    replInputLineRef.current.scrollIntoView();
  };

  return (
    <div className="App">
      <header>
        <h1>
          <a href="/">Lox playground</a>
        </h1>
      </header>
      <div className="repl" onClick={onClickRepl}>
        <div className="repl__logs">
          {history.map((historyItem, i) => (
            <div className="history-item" key={i}>
              <div className="history-item-input repl-line repl-line--input">
                <code className="repl-line__prompt">{'>'}</code>
                <code>{historyItem.input}</code>
              </div>
              <div className="history-item-logs">
                {historyItem.logs.map((log, i) => (
                  <code className={`repl-line repl-line--log-${log.type}`} key={i}>
                    {log.content}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
        <form className="repl__input-form" onSubmit={(evt) => onSubmitForm(evt)}>
          <div className="repl-line-active-input-scroll-wrapper">
            <div className="repl-line repl-line--active-input" ref={replInputLineRef}>
              <code className="repl-line__prompt">{'>'}</code>
              <textarea
                className="repl-input-form-line__input"
                value={input}
                onChange={(evt) => onChangeInput(evt.target.value)}
                onKeyPress={(evt) => onKeyPress(evt)}
                autoFocus
                placeholder="Type an expression to run"
                rows={1}
                ref={inputRef}
              ></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
