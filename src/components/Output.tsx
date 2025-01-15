interface OutputProps {
  output: string;
}

const Output: React.FC<OutputProps> = ({ output }) => {
  return (
    <div style={{ 
      backgroundColor: '#fff', 
      border: '1px solid #2e7d32', 
      padding: '20px', 
      width: '100%', 
      marginTop: '20px', 
      borderRadius: '5px' 
    }}>
      <pre style={{ margin: 0, fontFamily: 'monospace' }}>{output}</pre>
    </div>
  );
};

export default Output;
