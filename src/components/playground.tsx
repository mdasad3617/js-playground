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

    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model) => {
        const suggestions = [
          {
            label: 'for-loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {',
              '\tconst ${3:element} = ${2:array}[${1:i}];',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'For Loop',
            documentation: 'A basic for loop',
            range: model.getFullModelRange(),
          },
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'console.log(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Console Log',
            documentation: 'Log output to the console',
            range: model.getFullModelRange(),
          },
        ];
        return { suggestions };
      }
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
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      margin: '20px', 
      backgroundColor: '#e8f5e9', 
      color: '#2e7d32', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      justifyContent: 'center', 
      height: '100vh', 
      padding: '20px', 
      boxSizing: 'border-box' 
    }}>
      <h1 style={{ marginBottom: '20px' }}>js-playground</h1>
      <MonacoEditor
        height="60vh"
        language={language}
        theme="vs-light"
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
      <button onClick={runCode} style={{ 
        padding: '10px 20px', 
        fontSize: '16px', 
        backgroundColor: '#2e7d32', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        marginLeft: '0' 
      }}>
        ▶ Run Code
      </button>
      <Output output={output} />
      
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        fontSize: '14px', 
        color: '#2e7d32' 
      }}>
        Made by mdasad
      </footer>
    </div>
  );
};

export default Playground;
