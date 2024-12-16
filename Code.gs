const SS_ID = "1cfpTYarDEG4ZgK8gWmQVo45H1jpVbDyOowPDco8tB-k";
const AWARDS_ROW_START = 4; // Starting row for ticket results
const SHEET_NAME = new Date().getFullYear().toString();
const DRAW_ID = "1259409102"; // ID of the Christmas Lottery Draw 2024
const RAILWAY_PROXY_URL = "YOUR_RAILWAY_APP_URL"; // Replace with your Railway app URL

// --- Core Functionality ---
function getSpreadsheet() {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(SHEET_NAME);
}

function getLotteryData() {
  const url = `${RAILWAY_PROXY_URL}/api/lottery?drawId=${DRAW_ID}`; // Using our proxy URL in Railway
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = response.getContentText();
    Logger.log(`API Response: ${json}`);
    return JSON.parse(json);
  } catch (e) {
    Logger.log(`API Error: ${e.message}`);
    return {};
  }
}

function getAward(number) {
  const data = getLotteryData();
  if (data && data.compruebe) {
    const award = data.compruebe.find(p => p.decimo === number);
    if (award) {
      Logger.log(`Number ${number}: Award = ${award.prize} €`);
      return award.prize;
    }
  }
  Logger.log(`Number ${number}: No award found.`);
  return 0;
}

// --- Sheet Interaction ---
function getColumn(columnName) {
  const sheet = getSpreadsheet();
  const headers = sheet.getRange("A1:Z1").getValues()[0];
  Logger.log(`Headers detected: ${headers.join(", ")}`);

  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in headers: ${headers.join(", ")}`);
  }

  return sheet.getRange(AWARDS_ROW_START, colIndex + 1, sheet.getLastRow() - AWARDS_ROW_START + 1)
    .getValues()
    .flat();
}

function updateResults() {
  try {
    const sheet = getSpreadsheet();
    const numbers = getColumn("Número");
    const shares = getColumn("decimos");
    Logger.log(`Numbers fetched: ${numbers.join(", ")}`);

    numbers.forEach((num, i) => {
      const award = getAward(num);
      const row = AWARDS_ROW_START + i;
      sheet.getRange(row, 7).setValue(award); // Col G: Premio/decimo
      sheet.getRange(row, 8).setValue(award * shares[i]); // Col H: Premio
    });

    Logger.log("Results updated successfully.");
  } catch (e) {
    Logger.log(`Error in updateResults: ${e.message}`);
  }
}

function updateMainAwards() {
  try {
    const sheet = getSpreadsheet();
    const data = getLotteryData();
    if (data && data.compruebe) {
      const mainAwards = data.compruebe.slice(0, 13); // Get the top 13 awards

      const awards = ["Gordo", "Segundo", "Tercer", "Cuarto 1", "Cuarto 2", "Quinto 1", "Quinto 2", "Quinto 3", "Quinto 4", "Quinto 5", "Quinto 6", "Quinto 7", "Quinto 8"];

      awards.forEach((award, index) => {
        if (mainAwards[index]) {
          sheet.getRange(13 + index, 6).setValue(mainAwards[index].decimo); // Col F: Numero
          sheet.getRange(13 + index, 7).setValue(mainAwards[index].prize.toLocaleString()); // Col G: Premio/decimo
        }
      });

      Logger.log("Main awards updated successfully.");
    }
  } catch (e) {
    Logger.log(`Error in updateMainAwards: ${e.message}`);
  }
}

// --- Notifications ---
function notifyIfWinner() {
  const sheet = getSpreadsheet();
  const numbers = getColumn("Número");
  const notified = getColumn("Notificado");
  const recipient = getColumn("Para");
  const buyer = getColumn("Quien");
  const share = getColumn("decimos");

  numbers.forEach((num, i) => {
    const award = getAward(num);
    const row = AWARDS_ROW_START + i;

    if (award > 0 && notified[i] !== "Yes") {
      const email = recipient[i] || buyer[i]; // Use "Para" if available, otherwise use "Quien"
      MailApp.sendEmail({
        to: email,
        subject: "¡Has ganado la Lotería de Navidad!",
        htmlBody: `<p>¡Enhorabuena! Tu número <b>${num}</b> ha sido premiado con <b>${award.toLocaleString()}€</b> por décimo.</p>
                   <p>Has jugado ${share[i]} decimo(s).</p>
                   <p>Premio total: <b>${(award * share[i]).toLocaleString()}€</b></p>`
      });

      sheet.getRange(row, 9).setValue("Yes"); // Col I: Notificado
      Logger.log(`Notification sent for number ${num}, Award: ${award}€ to ${email}`);
    }
  });
}

// --- Triggers and UI ---
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Loteria")
    .addItem("Update Results", "updateResults")
    .addItem("Update Main Awards", "updateMainAwards")
    .addItem("Send Notifications", "notifyIfWinner")
    .addToUi();
}

// --- Trigger ---
// (Optional) Function to create a time-driven trigger. Run this once to set up the trigger.
function createTrigger() {
  ScriptApp.newTrigger("updateResultsAndNotify")
    .timeBased()
    .onDay(22)
    .atHour(9)
    .everyHours(1)
    .create();

  ScriptApp.newTrigger("updateMainAwards")
    .timeBased()
    .onDay(22)
    .atHour(9)
    .everyHours(1)
    .create();
}

// (Optional) Function to run both updateResults and notifyIfWinner. Triggered by the time-driven trigger.
function updateResultsAndNotify() {
  updateResults();
  updateMainAwards();
  notifyIfWinner();
}