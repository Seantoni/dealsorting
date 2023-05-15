document.getElementById("calculate").addEventListener("click", () => {
  const inputFile = document.getElementById("inputFile").files[0];
  if (!inputFile) {
    alert("Please select a CSV file");
    return;
  }

  Papa.parse(inputFile, {
    complete: processCSV,
    error: () => {
      alert("Input file format is not valid");
    }
  });
});

function removeCommas(str) {
  return str.replace(/,/g, "");
}

function processCSV(results) {
  const data = results.data.slice(1).map((row) => ({
    "business name": row[2],
    id: +removeCommas(row[0]),
    "vouchers sold": +removeCommas(row[9]),
    "Sold per day": +removeCommas(row[13]),
    "net revenue": +removeCommas(row[10]),
    "conversion rate": +removeCommas(row[12])
  }));

  const columns = [
    "vouchers sold",
    "Sold per day",
    "net revenue",
    "conversion rate"
  ];
  const factorWeights = [0.25, 0.1, 0.25, 0.4];

  for (const column of columns) {
    const minVal = Math.min(...data.map((row) => row[column]));
    const maxVal = Math.max(...data.map((row) => row[column]));

    for (const row of data) {
      row[column] =
        minVal === maxVal ? 0 : (row[column] - minVal) / (maxVal - minVal);
    }
  }

  for (const row of data) {
    row["Deal Score"] = columns.reduce(
      (acc, column, index) => acc + row[column] * factorWeights[index],
      0
    );
  }

  data.sort((a, b) => b["Deal Score"] - a["Deal Score"]);

  const outputData = [
    ["Rank", "business name", "id", "Deal Score"],
    ...data.map((row, index) => [
      index + 1,
      row["business name"],
      row["id"],
      row["Deal Score"]
    ])
  ];
  
  const outputCSV = Papa.unparse(outputData);

  const csvBlob = new Blob([outputCSV], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const tempLink = document.createElement("a");
  tempLink.href = csvUrl;
  tempLink.download = "output_file.csv";
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}
