function loadTextFile() {
  const selectBox = document.getElementById("select-lang");
  const selectedValue = selectBox.value;
  
  if (selectedValue === "coreano") {
    document.getElementsByTagName("h1")[0].textContent = "공부일라표";
  } else if (selectedValue === "japones") {
    document.getElementsByTagName("h1")[0].textContent = "勉強一覧表";
  }

  fetch(`${selectedValue}.csv`)
    .then(response => response.text())
    .then(data => {
      const textContainer = document.getElementById(`${selectedValue}-text-container`);
      const rows = data.split('\n');
      let csvHtml = `<table><thead><tr><th class='sortable' onclick='sortTable(0)'>Column 1</th><th class='sortable' onclick='sortTable(1)'>Column 2</th><th class='sortable' onclick='sortTable(2)'>Column 3</th></tr></thead><tbody>`;
      
      for (let i = 1; i < rows.length; i++) {
        csvHtml += "<tr>";
        
        const columns = rows[i].split(',');
        
        for (let j = 0; j < columns.length; j++) {
          csvHtml += `<td contenteditable>${columns[j]}</td>`;
        }
        
        csvHtml += "</tr>";
      }
      
      csvHtml += "</tbody></table>";
      textContainer.innerHTML = csvHtml;
      
      // Add hover effect to cells
      textContainer.addEventListener('mouseover', event => {
        if (event.target.tagName === 'TD') {
          event.target.style.transition = "border-color 0.5s";
          event.target.style.borderColor = "#F9E9CB";
        }
      });
      
      textContainer.addEventListener('mouseout', event => {
        if (event.target.tagName === 'TD') {
          event.target.style.transition = "border-color 0.5s";
          event.target.style.borderColor = "";
        }
      });
      
      // Add hover effect to column headers
      const headers = textContainer.querySelectorAll(".sortable");
      
      headers.forEach(header => {
        header.addEventListener("mouseover", () => {
          header.style.transition = "color 0.5s";
          header.style.color = "#94B78D";
        });
        
        header.addEventListener("mouseout", () => {
          header.style.transition = "color 0.5s";
          header.style.color = "";
        });
      });
      
      // Make table text unselectable
      const table = textContainer.querySelector("table");
      table.style.userSelect = "none";
      
      // Set even column widths
      const columnCount = table.querySelectorAll("thead tr th").length;
      const columnWidth = 100 / columnCount;
      const columnWidthString = `${columnWidth}%`;
      
      const columns = table.querySelectorAll("thead tr th, tbody tr td");
      
      columns.forEach(column => {
        column.style.width = columnWidthString;
      });
      
      // Add sort event listener to table headers
      let sortedHeader = null;
      
      const tableHeaders = table.querySelectorAll("thead th");
      
      tableHeaders.forEach(header => {
        header.addEventListener("click", () => {
          tableHeaders.forEach(header => header.style.background = "");
          sortedHeader = header;
                // Sort the table
      const index = header.cellIndex;
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      const sortOrder = header.dataset.sortOrder === "asc" ? "desc" : "asc";
      const multiplier = sortOrder === "asc" ? 1 : -1;

      rows.sort((a, b) => {
        const aVal = a.cells[index].textContent;
        const bVal = b.cells[index].textContent;
        if (aVal < bVal) return -1 * multiplier;
        if (aVal > bVal) return 1 * multiplier;
        return 0;
      });

      table.querySelector("thead th[data-sort-order]").removeAttribute("data-sort-order");
      header.setAttribute("data-sort-order", sortOrder);

      const tbody = table.querySelector("tbody");
      rows.forEach(row => {
        tbody.appendChild(row);
      });

      // Add hue transition to sorted column header
      header.style.transition = "background-color 0.5s";

      const hueShift = sortOrder === "asc" ? 120 : 0;
      let hue = hueShift;

      const hueInterval = setInterval(() => {
        hue = (hue + 1) % 360;
        header.style.backgroundColor = `hsl(${hue}, 70%, 90%)`;

        if (sortedHeader !== header) {
          clearInterval(hueInterval);
          header.style.backgroundColor = "";
        }
      }, 10);
    });
  });

  // Add double-click event listener to table rows
  const tableCells = table.querySelectorAll("tbody td");
  tableCells.forEach(cell => {
    cell.addEventListener("dblclick", () => {
      const value = cell.textContent;
      const input = document.createElement("input");
      input.type = "text";
      input.value = value;
      input.addEventListener("blur", () => {
        const newValue = input.value;
        cell.textContent = newValue;

        // Update CSV file with new data
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        let csvData = "Column 1,Column 2,Column 3\n";
        rows.forEach(row => {
          const columns = Array.from(row.querySelectorAll("td"));
          const rowText = columns.map(column => column.textContent).join(",");
          csvData += rowText + "\n";
        });

        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

// Replace the contents of the existing file with the updated data
fetch("data.csv", {
method: "PUT",
body: blob
}).then(() => {
// Reload the data from the updated file
fetch("data.csv")
.then(response => response.text())
.then(data => {
// Display the updated data in the table
const newTable = createTable(data);
table.parentNode.replaceChild(newTable, table);
});
});
      });

      cell.innerHTML = "";
      cell.appendChild(input);
      input.focus();
    });
  });
})
.catch(error => {
  console.error(`Error fetching ${textFile}: ${error}`);
});
}
