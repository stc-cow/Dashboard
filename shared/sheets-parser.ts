export interface SheetSite {
  SiteName: string;
  RegionName: string;
  lat: number;
  lng: number;
  NextFuelingPlan: string;
}

export interface ProcessedFuelData {
  sites: SheetSite[];
  centralSites: SheetSite[];
  today: SheetSite[];
  tomorrow: SheetSite[];
  afterTomorrow: SheetSite[];
  stats: {
    totalSites: number;
    centralSites: number;
    dueAndToday: number;
    tomorrowCount: number;
    afterTomorrowCount: number;
  };
}

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let insideQuotes = false;
  let currentCell = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      }
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function getColumnIndex(columnLetter: string): number {
  let index = 0;
  for (let i = 0; i < columnLetter.length; i++) {
    index = index * 26 + (columnLetter.charCodeAt(i) - 64);
  }
  return index - 1;
}

function columnNumberToLetter(num: number): string {
  let letter = "";
  let n = num + 1;
  while (n > 0) {
    n--;
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26);
  }
  return letter;
}

export async function fetchAndParseGoogleSheet(
  sheetUrl: string,
): Promise<SheetSite[]> {
  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      console.warn("No data found in sheet");
      return [];
    }

    // Column indices (0-based): B=1, D=3, L=11, M=12, AJ=35
    const colB = 1; // SiteName
    const colD = 3; // RegionName
    const colL = 11; // lat
    const colM = 12; // lng
    const colAJ = 35; // NextFuelingPlan

    const sites: SheetSite[] = [];

    // Start from row 1 (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const siteName = row[colB]?.trim();
      const regionName = row[colD]?.trim();
      const latStr = row[colL]?.trim();
      const lngStr = row[colM]?.trim();
      const fueleDate = row[colAJ]?.trim();

      if (!siteName || !fueleDate) {
        continue;
      }

      const lat = parseFloat(latStr || "0");
      const lng = parseFloat(lngStr || "0");

      if (isNaN(lat) || isNaN(lng)) {
        continue;
      }

      sites.push({
        SiteName: siteName,
        RegionName: regionName || "Unknown",
        lat,
        lng,
        NextFuelingPlan: fueleDate,
      });
    }

    return sites;
  } catch (error) {
    console.error("Error fetching/parsing Google Sheet:", error);
    return [];
  }
}

function calculateFuelStatus(
  fuelingDate: string,
): "today" | "tomorrow" | "afterTomorrow" | "future" | "overdue" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);

  const siteDate = new Date(fuelingDate);
  siteDate.setHours(0, 0, 0, 0);

  if (siteDate < today) {
    return "overdue";
  } else if (siteDate.getTime() === today.getTime()) {
    return "today";
  } else if (siteDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  } else if (siteDate.getTime() === afterTomorrow.getTime()) {
    return "afterTomorrow";
  }
  return "future";
}

export function processFuelData(sites: SheetSite[]): ProcessedFuelData {
  const centralSites = sites.filter(
    (site) =>
      site.RegionName && site.RegionName.toLowerCase().includes("central"),
  );

  const today: SheetSite[] = [];
  const tomorrow: SheetSite[] = [];
  const afterTomorrow: SheetSite[] = [];

  sites.forEach((site) => {
    const status = calculateFuelStatus(site.NextFuelingPlan);
    if (status === "today" || status === "overdue") {
      today.push(site);
    } else if (status === "tomorrow") {
      tomorrow.push(site);
    } else if (status === "afterTomorrow") {
      afterTomorrow.push(site);
    }
  });

  return {
    sites,
    centralSites,
    today,
    tomorrow,
    afterTomorrow,
    stats: {
      totalSites: sites.length,
      centralSites: centralSites.length,
      dueAndToday: today.length,
      tomorrowCount: tomorrow.length,
      afterTomorrowCount: afterTomorrow.length,
    },
  };
}
