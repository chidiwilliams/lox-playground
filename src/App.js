import { basicSetup } from '@codemirror/basic-setup';
import { keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { examplePrograms } from './example-programs';
import { RunnerWrapper } from './runner-wrapper';

const initialSelectedExample = examplePrograms[2];
const runner = new RunnerWrapper();

function App() {
  const [replInput, setReplInput] = useState('');
  const [history, setHistory] = useState([]);
  const replInputLineRef = useRef(null);
  const inputRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [editorInput, setEditorInput] = useState(initialSelectedExample.source);
  const [selectedExample, setSelectedExample] = useState(initialSelectedExample);

  const onSubmitForm = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    runCommand(replInput, false);
  };

  const runCommand = (src, isEditor) => {
    runner.run(src);
    setHistory([...history, { input: src, isEditor, logs: runner.logs }]);
    setReplInput('');
    setOffset(0);
  };

  useEffect(() => {
    replInputLineRef.current.scrollIntoView();
  }, [history]);

  const onChangeInput = (inputText) => {
    setReplInput(inputText);
  };

  const onKeyDown = (evt) => {
    if (evt.key === 'ArrowUp') {
      evt.preventDefault();
      const replHistory = history.filter((historyItem) => !historyItem.isEditor);
      if (offset < replHistory.length) {
        updateOffset(offset + 1);
      }
    } else if (evt.key === 'ArrowDown') {
      evt.preventDefault();
      if (offset > 1) {
        updateOffset(offset - 1);
      }
    }
  };

  const updateOffset = (newOffset) => {
    setOffset(newOffset);
    const replHistory = history.filter((historyItem) => !historyItem.isEditor);
    setReplInput(replHistory[replHistory.length - newOffset].input);
  };

  const onKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      if (replInput.trim().length > 0) {
        onSubmitForm();
      }
    }
  };

  const onClickRepl = () => {
    inputRef.current.focus();
    replInputLineRef.current.scrollIntoView();
  };

  const onClickInput = (index) => {
    const historyItem = history[index];
    if (historyItem.isEditor) {
      setEditorInput(historyItem.input);
    } else {
      setReplInput(history[index].input);
    }
  };

  const runEditorInput = () => {
    runCommand(editorInput, true);
  };

  const onClickEditorExample = (evt) => {
    const name = evt.target.value;
    const example = examplePrograms.find((example) => example.name === name);
    if (example) {
      setSelectedExample(example);
      setEditorInput(example.source);
    }
  };

  const editorExtensions = [
    keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          runEditorInput();
          return true; // disable other mappings for this key
        },
      },
    ]),
    basicSetup,
  ];

  useEffect(() => {
    runEditorInput();
  }, []);

  return (
    <div className="App">
      <header>
        <h1>
          <a href="/">Lox playground</a>
        </h1>
      </header>
      <div className="workspace">
        <div className="editor">
          <div className="editor-menu">
            <select
              placeholder="Examples"
              onChange={onClickEditorExample}
              value={selectedExample.name}
            >
              <option>-- examples --</option>
              {examplePrograms.map((example, i) => (
                <option value={example.name} key={i}>
                  {example.name}
                </option>
              ))}
            </select>
            <button onClick={runEditorInput}>Run</button>
          </div>
          <CodeMirror
            height="100%"
            className="code-mirror"
            value={editorInput}
            onChange={(value) => {
              setEditorInput(value);
            }}
            extensions={editorExtensions}
            basicSetup={false}
            theme="dark"
          />
        </div>
        <div className="repl" onClick={onClickRepl}>
          <div className="repl__logs">
            {history.map((historyItem, i) => (
              <div className="history-item" key={i}>
                <div
                  className="history-item-input repl-line repl-line--input"
                  onClick={() => onClickInput(i)}
                >
                  <code className="repl-line__prompt">{'>'}</code>
                  <code>
                    {historyItem.isEditor ? (
                      <span>
                        <i>(editor)</i>
                      </span>
                    ) : (
                      historyItem.input
                    )}
                  </code>
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
                  className="repl-input-form-line__input code"
                  value={replInput}
                  onChange={(evt) => onChangeInput(evt.target.value)}
                  onKeyPress={(evt) => onKeyPress(evt)}
                  onKeyDown={(evt) => onKeyDown(evt)}
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
      <div className="about">
        <p>
          This playground runs Lox, the programming language from Robert Nystrom's{' '}
          <a href="https://craftinginterpreters.com/" target="_blank" rel="noreferrer">
            Crafting Interpreters
          </a>
          . Built by{' '}
          <a href="https://chidiwilliams.com/" target="_blank" rel="noreferrer">
            Chidi
          </a>
          . Inspired by the{' '}
          <a href="https://play.dotink.co/" target="_blank" rel="noreferrer">
            Ink playground
          </a>
          . View the source on{' '}
          <a
            href="https://github.com/chidiwilliams/lox-playground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default App;
