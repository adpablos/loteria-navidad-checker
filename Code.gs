/**
 * Constants for spreadsheet and sheet names
 */
const SS_ID = "1cfpTYarDEG4ZgK8gWmQVo45H1jpVbDyOowPDco8tB-k";
const SHEET_NAME = new Date().getFullYear().toString();

/**
 * Constants for column indexes
 */
const COLUMNS = {
    NUMBER: 0,        // A: Número
    SHARES: 1,        // B: Decimos
    BUYER: 2,         // C: Quien
    RECIPIENT: 3,     // D: Para
    AWARD_PER_SHARE: 4, // E: Premio/decimo
    BETWEEN: 5,       // F: Entre
    AWARD: 6,         // G: Premio
    NOTIFIED: 7,      // H: Notificado
    SIMULATE: 8       // I: Simular
};

/**
 * Constants for API
 */
const API = {
    BASE_URL: "loteria-navidad-checker-production.up.railway.app",
    ENDPOINTS: {
        TICKET: "/api/lottery/ticket",
        RESULTS: "/api/lottery/results"
    }
};

/**
 * Constants for the lottery draw
 */
const DRAW_CONFIG = {
    ID: "1259409102",
    AWARDS_START_ROW: 10,
    MAIN_AWARDS_START_ROW: 18,
    MAIN_AWARDS_COUNT: 13
};

/**
 * Gets the current spreadsheet
 */
function getSpreadsheet() {
    return SpreadsheetApp.openById(SS_ID).getSheetByName(SHEET_NAME);
}

/**
 * Builds API URLs
 */
const ApiUrlBuilder = {
    getTicketUrl: (drawId) => 
        `https://${API.BASE_URL}${API.ENDPOINTS.TICKET}?drawId=${drawId}`,
    
    getResultsUrl: (drawId) => 
        `https://${API.BASE_URL}${API.ENDPOINTS.RESULTS}?drawId=${drawId}`
};

/**
 * Gets lottery data from both endpoints
 */
async function getLotteryData() {
    try {
        const [ticketData, resultsData] = await Promise.all([
            fetchApi(ApiUrlBuilder.getTicketUrl(DRAW_CONFIG.ID)),
            fetchApi(ApiUrlBuilder.getResultsUrl(DRAW_CONFIG.ID))
        ]);

        return {
            ticketData,
            resultsData
        };
    } catch (error) {
        console.error('Error fetching lottery data:', error);
        return null;
    }
}

/**
 * Generic API fetch function with error handling
 */
async function fetchApi(url) {
    try {
        const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        const statusCode = response.getResponseCode();

        if (statusCode !== 200) {
            throw new Error(`API request failed with status code: ${statusCode}`);
        }

        return JSON.parse(response.getContentText());
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        throw error;
    }
}

/**
 * Updates the main awards table using the results endpoint
 */
function updateMainAwards(resultsData) {
    if (!resultsData) return;

    const sheet = getSpreadsheet();
    const awards = [
        { name: "Gordo", prize: resultsData.primerPremio },
        { name: "Segundo", prize: resultsData.segundoPremio },
        { name: "Tercer", prize: resultsData.tercerosPremios[0] },
        { name: "Cuarto 1", prize: resultsData.cuartosPremios[0] },
        { name: "Cuarto 2", prize: resultsData.cuartosPremios[1] },
        ...resultsData.quintosPremios.map((prize, index) => 
            ({ name: `Quinto ${index + 1}`, prize }))
    ];

    // Clear previous values
    const clearRange = sheet.getRange(
        DRAW_CONFIG.MAIN_AWARDS_START_ROW, 
        1, 
        DRAW_CONFIG.MAIN_AWARDS_COUNT, 
        3
    );
    clearRange.clearContent();

    // Update with new values
    awards.forEach((award, index) => {
        if (award.prize) {
            const row = DRAW_CONFIG.MAIN_AWARDS_START_ROW + index;
            sheet.getRange(row, 1).setValue(award.name);
            sheet.getRange(row, 2).setValue(award.prize.decimo);
            sheet.getRange(row, 3).setValue(award.prize.prize);
        }
    });
}

/**
 * Updates individual ticket results using the ticket endpoint
 */
function updateTicketResults(ticketData) {
    const sheet = getSpreadsheet();
    const numbersColumn = getColumn("Número");
    const sharesColumn = getColumn("decimos");

    if (!numbersColumn || !sharesColumn) return;

    // Clear previous values
    const lastRow = sheet.getLastRow();
    const clearRange = sheet.getRange(
        DRAW_CONFIG.AWARDS_START_ROW, 
        COLUMNS.AWARD_PER_SHARE + 1, 
        lastRow - DRAW_CONFIG.AWARDS_START_ROW + 1, 
        2
    );
    clearRange.clearContent();

    // Update ticket results
    numbersColumn.forEach((num, i) => {
        if (!num || typeof num !== 'number') return;

        const row = DRAW_CONFIG.AWARDS_START_ROW + i;
        const share = sharesColumn[i];
        const award = findAward(ticketData, num.toString());

        if (award) {
            sheet.getRange(row, COLUMNS.AWARD_PER_SHARE + 1).setValue(award.prize);
            sheet.getRange(row, COLUMNS.AWARD + 1).setValue(award.prize * share);
        }
    });
}

/**
 * Updates the status message in the spreadsheet
 */
function updateStatus(success = true) {
    const sheet = getSpreadsheet();
    const timestamp = new Date().toLocaleString();
    const message = success 
        ? `Resultados actualizados - Última actualización: ${timestamp}`
        : `Sorteo no disponible - Última actualización: ${timestamp}`;
    
    sheet.getRange("B5").setValue(message);
}

/**
 * Main function to update all lottery information
 */
async function updateLotteryInformation() {
    try {
        const data = await getLotteryData();
        
        if (!data) {
            updateStatus(false);
            return;
        }

        updateMainAwards(data.resultsData);
        updateTicketResults(data.ticketData);
        updateStatus(true);

    } catch (error) {
        console.error('Error updating lottery information:', error);
        updateStatus(false);
    }
}

/**
 * Trigger function when spreadsheet is opened
 */
function onOpen() {
    updateLotteryInformation();
    createMenu();
}

/**
 * Creates the menu in the spreadsheet
 */
function createMenu() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("Loteria")
        .addItem("Update Results", "updateLotteryInformation")
        .addItem("Send Notifications", "notifyIfWinner")
        .addToUi();
}