import React, { useState, useEffect, useCallback } from 'react';
import Output from './Output';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';

const Playground: React.FC = () => {
  const [editorValue, setEditorValue] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [language] = useState<'javascript'>('javascript');

  useEffect(() => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
    });

    // Register JavaScript Code Snippets
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Console Log',
            documentation: 'Logs output to the console',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column + 1,
            },
          },
          {
            label: 'forEach',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:array}.forEach(${2:item} => {\n\t$0\n});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Array forEach Loop',
            documentation: 'Iterate through an array with forEach',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column + 1,
            },
          },
          {
            label: 'async-await',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'async function ${1:fetchData}() {',
              '\ttry {',
              '\t\tconst response = await fetch(${2:\'https://api.example.com\'});',
              '\t\tconst data = await response.json();',
              '\t\tconsole.log(data);',
              '\t} catch (error) {',
              '\t\tconsole.error(error);',
              '\t}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Async Function',
            documentation: 'Creates an asynchronous function',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column + 1,
            },
          },
          {
            label: 'fetch',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'fetch(${1:\'https://api.example.com\'})\n\t.then(response => response.json())\n\t.then(data => console.log(data))\n\t.catch(error => console.error(error));',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Fetch API',
            documentation: 'Performs an HTTP request',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column + 1,
            },
          },
          {
            label: 'setTimeout',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'setTimeout(() => {\n\t$0\n}, ${1:1000});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'setTimeout Function',
            documentation: 'Executes code after a delay',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column + 1,
            },
          },
        ];

        const currentText = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        console.log(currentText);

        return { suggestions };
      },
    });

    // Enable Advanced IntelliSense
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Enable Automatic Variable Suggestions
    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['.', '"', "'", '`', '/', '@'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Suggest common built-in objects
        if (textUntilPosition.endsWith('.')) {
          return {
            suggestions: [
              {
                label: 'map',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'map(${1:item} => ${2:item})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Array Map Method',
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column + 1,
                },
              },
              {
                label: 'filter',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'filter(${1:item} => ${2:condition})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Array Filter Method',
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column + 1,
                },
              },
              {
                label: 'reduce',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'reduce((acc, curr) => acc + curr, 0)',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Array Reduce Method',
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column + 1,
                },
              },
            ],
          };
        }
        return { suggestions: [] };
      },
    });
  }, []);

  const runCode = useCallback(() => {
    try {
      const consoleLogOutput: string[] = [];
      const customConsole = {
        log: (...args: any[]) => consoleLogOutput.push(args.join(' ')),
      };

      const wrappedCode = `(function(console) { ${editorValue} })(customConsole);`;
      new Function('customConsole', wrappedCode)(customConsole);

      setOutput(consoleLogOutput.length > 0 ? consoleLogOutput.join('\n') : 'Code executed successfully!');
    } catch (error: any) {
      setOutput('Error: ' + error.message);
    }
  }, [editorValue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === 'Enter') {
        event.preventDefault();
        runCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [runCode]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#E9FCE9', height: '100vh', border: '2px solid lightgreen' }}>
      <h1>JavaScript Playground</h1>
      <MonacoEditor
        height="60vh"
        language={language}
        theme="vs"
        value={editorValue}
        onChange={setEditorValue}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
      <br />
      <button onClick={runCode} style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', borderRadius: '5px' }}>
        ▶ Run Code
      </button>
      <Output output={output} />
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        fontSize: '14px', 
      }}>
        Made by mdasad
      </footer>
    </div>
    
  );
};

export default Playground;
