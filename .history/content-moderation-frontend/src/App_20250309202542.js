const handleUpload = async () => {
  if (!file) {
    setError("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    setMessage(data.is_safe ? "✅ Safe Image" : "🚨 Unsafe Image");
  } catch (err) {
    setError(`Error: ${err.message}`);
  }
};
