import React, { useState } from "react";
import * as d3 from "d3";
import StreamGraph from "./StreamGraph";

const UploadComponent = () => {
  const [data, setData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = d3.csvParse(e.target.result);
        const parsedData = csv.map((d) => ({
          Date: new Date(d.Date),
          "LLaMA-3.1": +d["LLaMA-3.1"],
          Claude: +d["Claude"],
          "PaLM-2": +d["PaLM-2"],
          Gemini: +d["Gemini"],
          "GPT-4": +d["GPT-4"],
        }));
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      {!data ? (
        <div>
          <h1>Upload Hashtag Data</h1>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
      ) : (
        <StreamGraph data={data} />
      )}
    </div>
  );
};

export default UploadComponent;
