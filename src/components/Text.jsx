function Text({ transcript }) {

    return (
  
      <textarea placeholder="Transcripts will appear here...."
        rows="12"
        cols="100"
        value={transcript}
        readOnly
      />
  
    );
  
  }
  
  export default Text;