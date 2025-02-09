async function fetchJsonFromUrl(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching JSON:', error);
    }
}

function checkFileExists(url) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      xhr.onerror = function() {
        resolve(false);
      };
      xhr.send();
    });
  }

function fetchTitle(titleNumber) {
    let url = `./cfr_json/title-${titleNumber}.json`;
    fetchJsonFromUrl(url).then(data => displayTitle(data)).catch(error => console.error(error));
}

function displayTitle(titleJson) {
    const content = document.createElement("li");
    const identifier = titleJson["identifier"];
    const label = titleJson["label"];
    
    content.id = `cfr-title-${identifier}`;
    content.classList.add('list-group-item');
    content.innerHTML = `${label}`;

    const titles = document.getElementById("cfr-titles");
    titles.appendChild(content);
}

function generateColor(value, maxValue = (1.0 / 50) + 0.05) {
    let scaledValue = Math.max(0, Math.min(1, value / maxValue));
  
    const red = Math.round(255 * scaledValue);
    const green = Math.round(255 * (1 - scaledValue));
  
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
  
    return `#${redHex}${greenHex}0030`;
}

function statPercentage() {
    for (let i = 1; i < 51; i++) {
        if (i == 35) continue;

        const cfrTitleLi = document.getElementById("cfr-title-" + i);
        if (cfrTitleLi) {
            cfrTitleLi.setAttribute("title-pct", title_breakdown_json[i]);
            cfrTitleLi.style.backgroundColor = generateColor(title_breakdown_json[i]);
        }

        let pct = title_breakdown_json[i] * 100.0;
        document.getElementById(`cfr-title-${i}-stat`).innerHTML = parseFloat(pct.toFixed(3)) + "% of all regulations";
    }

    document.getElementById("active-statistic").innerText = "Percentage of total CFR content";
}

function statCorrections() {
    for (let i = 1; i < 51; i++) {
        if (i == 35) continue;

        document.getElementById(`cfr-title-${i}-stat`).innerHTML = "";

        const cfrTitleLi = document.getElementById("cfr-title-" + i);
        if (cfrTitleLi)
            cfrTitleLi.style.backgroundColor = "white";

        let titleCorrections = corrections_breakdown_json[String(i)];
        if (titleCorrections == null) continue;

        let titleCorrectionsHTML = "";
        for (const year in titleCorrections) {
            titleCorrectionsHTML += `  Year: ${year}, Value: ${titleCorrections[year]}`;
        }

        const labels = Object.keys(titleCorrections);
        const values = Object.values(titleCorrections);

        const ctx = document.createElement("canvas");
        ctx.width = 300;
        ctx.height = 150;
        ctx.id = `cfr-title-${i}-stat-chart`;
        
        document.getElementById(`cfr-title-${i}-stat`).appendChild(ctx);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Corrections',
                    data: values,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    document.getElementById("active-statistic").innerText = "Corrections per year";
}

function statWorkforce() {
    for (let i = 1; i < 51; i++) {
        if (i == 35) continue;

        const cfrTitleLi = document.getElementById("cfr-title-" + i);
        if (cfrTitleLi) {
            cfrTitleLi.style.backgroundColor = "white";
        }

        let totalWorkforce = 0;
        let male = 0;
        let female = 0;
        statHTML = "";
        for (const deptName in workforce_breakdown_json) {
            if (hasChildWithSpecificText(document.getElementById(`cfr-title-${i}`), deptName)) {
                totalWorkforce += workforce_breakdown_json[deptName]["total_workforce"];
                male += workforce_breakdown_json[deptName]["male"];
                female += workforce_breakdown_json[deptName]["female"];
            }
        }
        if (totalWorkforce == 0) {
            statHTML += "Not reporting";
        } else {
            statHTML += "Estimated total workforce: " + totalWorkforce + "<br>";
            let malePct = (male / totalWorkforce) * 100;
            let femalePct = (female / totalWorkforce) * 100;
            statHTML += "Percentage male: " + parseFloat(malePct.toFixed(3)) + "%<br>";
            statHTML += "Percentage female: " + parseFloat(femalePct.toFixed(3)) + "%<br>";
        }

        document.getElementById(`cfr-title-${i}-stat`).innerHTML = statHTML;
    }

    document.getElementById("active-statistic").innerText = "Workforce";
}

function statWorkforceToPercentage() {
    for (let i = 1; i < 51; i++) {
        if (i == 35) continue;

        let totalWorkforce = 0;
        statHTML = "";
        for (const deptName in workforce_breakdown_json) {
            if (hasChildWithSpecificText(document.getElementById(`cfr-title-${i}`), deptName)) {
                totalWorkforce += workforce_breakdown_json[deptName]["total_workforce"];
            }
        }
        if (totalWorkforce == 0) {
            statHTML += "Not reporting";
        } else {
            statHTML += "Estimated total workforce: " + totalWorkforce + "<br>";
        }

        document.getElementById(`cfr-title-${i}-stat`).innerHTML = statHTML;
    }

    for (let i = 1; i < 51; i++) {
        if (i == 35) continue;

        const cfrTitleLi = document.getElementById("cfr-title-" + i);
        if (cfrTitleLi) {
            cfrTitleLi.setAttribute("title-pct", title_breakdown_json[i]);
            cfrTitleLi.style.backgroundColor = generateColor(title_breakdown_json[i]);
        }
    }

    document.getElementById("active-statistic").innerText = "Workforce to percentage of total CFR content";
}

function hasChildWithSpecificText(element, searchText) {
    if (!element) return false;

    for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && levenshteinDistance(child.textContent, searchText) <= 7) {
            return true;
        }
        if (child.nodeType === Node.ELEMENT_NODE && hasChildWithSpecificText(child, searchText)) {
            return true;
        }
    }
    return false;
}

const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
  
    const matrix = [];
  
    for (let i = 0; i <= t.length; i++) {
      matrix[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        matrix[i][j] = i === 0 ? j : 0;
      }
    }
  
    for (let i = 1; i <= t.length; i++) {
      for (let j = 1; j <= s.length; j++) {
        const cost = s[j - 1] === t[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,         // Deletion
          matrix[i][j - 1] + 1,         // Insertion
          matrix[i - 1][j - 1] + cost   // Substitution
        );
      }
    }
  
    return matrix[t.length][s.length];
};
