function Text({ transcript }) {

    return (
  
      <textarea
        rows="12"
        cols="100"
        value={transcript}
        readOnly
      />
  
    );
  
  }
  
  export default Text;