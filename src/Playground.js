import { basicSetup } from '@codemirror/basic-setup';
import { keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useRef, useState } from 'react';
import { examplePrograms } from './example-programs';
import './Playground.css';
import { run } from './runner';

const initialSelectedExample = examplePrograms[3];

function Playground() {
  const [replInput, setReplInput] = useState('');
  const [history, setHistory] = useState([]);
  // Used for up-down navigation to previous commands. offset is the
  // "distance" from the current input to the selected undo input
  const [replUndoOffset, setReplUndoOffset] = useState(0);
  const [editorInput, setEditorInput] = useState(initialSelectedExample.source);
  const [selectedExample, setSelectedExample] = useState(initialSelectedExample);

  const replInputLineRef = useRef(null);
  const replInputRef = useRef(null);

  // Scroll to the REPL input when the history changes (i.e. after each input)
  useEffect(() => {
    replInputLineRef.current.scrollIntoView();
  }, [history]);

  // Run editor input on start
  useEffect(() => {
    runEditorInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitReplInputForm = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    runProgram(replInput, false);
  };

  const runProgram = (src, isEditor) => {
    const logs = run(src);
    setHistory([...history, { input: src, isEditor, logs }]);
    setReplInput(''); // empty repl input
    setReplUndoOffset(0); // reset undo offset
  };

  const onChangeReplInput = (inputText) => {
    setReplInput(inputText);
  };

  const onReplInputKeyDown = (evt) => {
    if (evt.key === 'ArrowUp') {
      evt.preventDefault();
      // undo navigation should only target repl inputs and ignore editor inputs
      const replHistory = history.filter((historyItem) => !historyItem.isEditor);
      if (replUndoOffset < replHistory.length) {
        updateOffset(replUndoOffset + 1);
      }
    } else if (evt.key === 'ArrowDown') {
      evt.preventDefault();
      if (replUndoOffset > 1) {
        updateOffset(replUndoOffset - 1);
      }
    }
  };

  const updateOffset = (newOffset) => {
    setReplUndoOffset(newOffset);
    // undo navigation should only target repl inputs and ignore editor inputs
    const replHistory = history.filter((historyItem) => !historyItem.isEditor);
    setReplInput(replHistory[replHistory.length - newOffset].input);
  };

  const onReplInputKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      if (replInput.trim().length > 0) {
        onSubmitReplInputForm();
      }
    }
  };

  const onClickReplContainer = () => {
    // Focus on the repl input element and keep in view
    replInputRef.current.focus();
    replInputLineRef.current.scrollIntoView();
  };

  const onClickHistoryInput = (index) => {
    // Restore selected input to editor/repl
    const historyItem = history[index];
    if (historyItem.isEditor) {
      setEditorInput(historyItem.input);
    } else {
      setReplInput(history[index].input);
    }
  };

  const runEditorInput = () => {
    runProgram(editorInput, true);
  };

  const onClickEditorExample = (evt) => {
    const exampleName = evt.target.value;
    const example = examplePrograms.find((example) => example.name === exampleName);
    if (example) {
      setSelectedExample(example);
      setEditorInput(example.source);
    }
  };

  const editorExtensions = [
    keymap.of([
      // on Ctrl-Enter (Windows) / Cmd-Enter (Mac), run the editor
      {
        key: 'Mod-Enter',
        run: () => {
          runEditorInput();
          return true; // disables adding new line
        },
      },
    ]),
    basicSetup,
  ];

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
        <div className="repl" onClick={onClickReplContainer}>
          <div className="repl__logs">
            {history.map((historyItem, i) => (
              <div className="history-item" key={i}>
                <div
                  className="history-item-input repl-line repl-line--input"
                  onClick={() => onClickHistoryInput(i)}
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
          <form className="repl__input-form" onSubmit={(evt) => onSubmitReplInputForm(evt)}>
            <div className="repl-line-active-input-scroll-wrapper">
              <div className="repl-line repl-line--active-input" ref={replInputLineRef}>
                <code className="repl-line__prompt">{'>'}</code>
                <textarea
                  className="repl-input-form-line__input code"
                  value={replInput}
                  onChange={(evt) => onChangeReplInput(evt.target.value)}
                  onKeyPress={(evt) => onReplInputKeyPress(evt)}
                  onKeyDown={(evt) => onReplInputKeyDown(evt)}
                  autoFocus
                  placeholder="Type an expression to run"
                  rows={1}
                  ref={replInputRef}
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

export default Playground;
