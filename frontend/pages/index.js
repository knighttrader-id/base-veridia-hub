import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }

    setResult('Uploading...');

    try {
      // Upload file to backend
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadData = await uploadResponse.json();

      // Record copyright
      const recordResponse = await fetch('http://localhost:3001/api/record-copyright', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash: uploadData.hash,
          title,
          description
        })
      });

      if (!recordResponse.ok) throw new Error('Recording failed');

      const recordData = await recordResponse.json();

      setResult(`
        Success!
        Hash: ${uploadData.hash}
        Transaction: ${recordData.transactionHash}
        Work ID: ${recordData.workId}
      `);
    } catch (error) {
      setResult('Error: ' + error.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>VeridiaHub - Record Your Copyright</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <input
          type="text"
          placeholder="Work Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
        />
        <button type="submit">Upload and Record Copyright</button>
      </form>
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        {result}
      </div>
    </div>
  );
}