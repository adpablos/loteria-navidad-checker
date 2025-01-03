/**
 * Constants for spreadsheet and sheet names
 */
const SS_ID = "1cfpTYarDEG4ZgK8gWmQVo45H1jpVbDyOowPDco8tB-k";
const SHEET_NAME = new Date().getFullYear().toString();

/**
 * Constants for column names (used for lookup)
 */
const COLUMN_NAMES = {
    "numero": "Número",
    "decimos": "Decimos",
    "quien": "Quien",
    "para": "Para",
    "premio_decimo": "Premio/decimo",
    "entre": "Entre",
    "premio": "Premio",
    "notificado": "Notificado"
};

/**
 * Constants for column indexes
 */
const COLUMNS = {
    NUMBER: 0,        // A: Número
    SHARES: 1,        // B: Decimos
    BUYER: 2,        // C: Quien
    RECIPIENT: 3,     // D: Para
    PARA: 4,         // E: Para (no tocar)
    AWARD_PER_SHARE: 5, // F: Premio/decimo
    BETWEEN: 6,      // G: Entre (no tocar)
    AWARD: 7,        // H: Premio (calculado por fórmula)
    NOTIFIED: 8,     // I: Notificado
    SIMULATE: 9      // J: Simular
};

/**
 * Constants for API
 */
const API = {
    BASE_URL: "loteria-navidad-checker-production.up.railway.app",
    ENDPOINTS: {
        CHECK_TICKET: "/api/lottery/check",
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
 * Add mock flag and mock responses
 */
const MOCK_MODE = false; // Toggle this to enable/disable mock mode
const MOCK_RESPONSES = {
    check: {
        data: {
            decimo: "20884",
            isPremiado: true,
            prizeEuros: 60000,
            prizeType: "G",
            message: "El Gordo! [MOCK]"
        }
    },
    ticket: {
        "tipoSorteo": "X",
        "drawIdSorteo": "1258609100",
        "compruebe": [
            {
                "decimo": "20884",
                "prize": 6000000,
                "prizeType": "G"
            },
            {
                "decimo": "64390",
                "prize": 1200000,
                "prizeType": "Z"
            },
            {
                "decimo": "74209",
                "prize": 50000,
                "prizeType": "T"
            },
            {
                "decimo": "02891",
                "prize": 600,
                "prizeType": "R"
            }
        ]
    },
    results: {
        "primerPremio": {
            "decimo": "20884",
            "prize": 6000000
        },
        "segundoPremio": {
            "decimo": "64390",
            "prize": 1200000
        },
        "tercerosPremios": [
            {
                "decimo": "74209",
                "prize": 50000
            }
        ],
        "cuartosPremios": [
            {
                "decimo": "12345",
                "prize": 20000
            },
            {
                "decimo": "67890",
                "prize": 20000
            }
        ],
        "quintosPremios": [
            {
                "decimo": "11111",
                "prize": 6000
            },
            {
                "decimo": "22222",
                "prize": 6000
            },
            {
                "decimo": "33333",
                "prize": 6000
            },
            {
                "decimo": "44444",
                "prize": 6000
            },
            {
                "decimo": "55555",
                "prize": 6000
            },
            {
                "decimo": "66666",
                "prize": 6000
            },
            {
                "decimo": "77777",
                "prize": 6000
            },
            {
                "decimo": "88888",
                "prize": 6000
            }
        ]
    }
};

/**
 * Shows a standardized sheet not found alert and returns if user wants to see instructions
 */
function showSheetNotFoundAlert() {
    Logger.log("⚠️ Showing sheet not found alert...");
    const ui = SpreadsheetApp.getUi();
    const currentYear = new Date().getFullYear().toString();
    
    const result = ui.alert(
        '⚠️ Pestaña no encontrada',
        `No se ha encontrado la pestaña "${currentYear}" necesaria para el funcionamiento.\n\n` +
        'Por favor:\n' +
        '1. Crea una nueva pestaña con el nombre "' + currentYear + '"\n' +
        '2. Usa la pestaña "Ejemplo-Vacío" como referencia para su estructura\n' +
        '3. Rellena tus números de lotería\n\n' +
        '¿Quieres ver las instrucciones completas?',
        ui.ButtonSet.YES_NO
    );
    
    if (result === ui.Button.YES) {
        Logger.log("👆 User requested to see instructions");
        const success = showInstructions();
        if (!success) {
            Logger.log("❌ Failed to navigate to instructions");
            ui.alert('Error', 
                    'No se pudo abrir la pestaña de instrucciones. Por favor, búscala manualmente.',
                    ui.ButtonSet.OK);
        }
    } else {
        Logger.log("👆 User declined to see instructions");
    }
    
    return false;
}

/**
 * Shows instructions sheet
 * @return {boolean} True if successfully navigated to instructions
 */
function showInstructions() {
    Logger.log("📖 Attempting to open instructions sheet...");
    try {
        const ss = SpreadsheetApp.getActive();
        const instructionsSheet = ss.getSheetByName('Instrucciones');
        
        if (!instructionsSheet) {
            Logger.log("❌ Instructions sheet 'Instrucciones' not found");
            return false;
        }
        
        ss.setActiveSheet(instructionsSheet);
        SpreadsheetApp.flush(); // Force the UI to update
        Logger.log("✅ Successfully navigated to instructions sheet");
        return true;
        
    } catch (error) {
        Logger.log(`❌ Error showing instructions: ${error}`);
        return false;
    }
}

/**
 * Gets the current spreadsheet (cached to avoid multiple lookups)
 */
let _cachedSheet = null;
function getSpreadsheet() {
    if (_cachedSheet) return _cachedSheet;
    
    const ss = SpreadsheetApp.getActive();
    const currentYear = new Date().getFullYear().toString();
    const sheet = ss.getSheetByName(currentYear);
    
    if (!sheet) {
        Logger.log(`❌ Sheet ${currentYear} not found`);
        return null;
    }
    
    _cachedSheet = sheet;
    return sheet;
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
 * Modified fetchLotteryData to use mock data when MOCK_MODE is true
 */
function fetchLotteryData(endpoint, drawId) {
  if (MOCK_MODE) {
    Logger.log(`Using mock data for endpoint: ${endpoint}`);
    return MOCK_RESPONSES[endpoint];
  }

  const baseUrl = "https://loteria-navidad-checker-production.up.railway.app/api/lottery";
  const url = `${baseUrl}/${endpoint}/${drawId}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log(`Error fetching data: ${error}`);
    throw error;
  }
}

/**
 * Gets lottery data from both endpoints
 */
async function getLotteryData() {
    try {
        const [ticketData, resultsData] = await Promise.all([
            fetchLotteryData("ticket", DRAW_CONFIG.ID),
            fetchLotteryData("results", DRAW_CONFIG.ID)
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
    Logger.log("🎯 Updating main awards table...");
    
    // Define the awards mapping
    const awards = [
        { name: "Gordo", data: resultsData.primerPremio },
        { name: "Segundo", data: resultsData.segundoPremio },
        { name: "Tercer", data: resultsData.tercerosPremios?.[0] },
        { name: "Cuarto 1", data: resultsData.cuartosPremios?.[0] },
        { name: "Cuarto 2", data: resultsData.cuartosPremios?.[1] },
        ...resultsData.quintosPremios?.map((prize, index) => 
            ({ name: `Quinto ${index + 1}`, data: prize }))
    ];

    Logger.log(`Found ${awards.length} awards to update`);

    // Find the results table start row
    const resultsTableRow = findResultsTableRow(sheet);
    if (!resultsTableRow) {
        Logger.log("❌ Could not find results table");
        return;
    }

    Logger.log(`📝 Found results table starting at row ${resultsTableRow}`);

    // Update awards in the correct cells
    awards.forEach((award, index) => {
        if (award.data) {
            const row = resultsTableRow + index;
            sheet.getRange(row, 4).setValue(award.name);        // Column D (Premio)
            sheet.getRange(row, 5).setValue(award.data.decimo); // Column E (Número)
            sheet.getRange(row, 6).setValue(award.data.prize);  // Column F (Premio)
            Logger.log(`✅ Updated ${award.name}: ${award.data.decimo} - ${award.data.prize.toLocaleString()}€`);
        }
    });
}

/**
 * Finds the row where the results table starts
 * @param {Sheet} sheet The spreadsheet to search in
 * @returns {number|null} The row number where the results table starts or null if not found
 */
function findResultsTableRow(sheet) {
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
        // Buscar en todas las columnas de la fila
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] === "Resultados sorteo") {
                Logger.log(`🎯 Found "Resultados sorteo" at row ${i + 1}, column ${j + 1}`);
                return i + 2; // +2 porque queremos la primera fila después del encabezado
            }
        }
    }
    Logger.log("❌ Could not find 'Resultados sorteo' header");
    return null;
}

/**
 * Finds an award in the lottery data
 * @param {object} data The lottery data
 * @param {string} number The number to find
 * @returns {object|null} The award or null if not found
 */
function findAward(data, number) {
    if (!data || !data.compruebe) return null;
    
    const award = data.compruebe.find(item => item.decimo === number);
    return award || null;
}

/**
 * Structure to hold table boundaries
 */
class TableBoundaries {
    constructor(startRow, endRow, columns) {
        this.startRow = startRow;
        this.endRow = endRow;
        this.columns = columns;
    }
}

/**
 * Finds the main table boundaries
 * @param {Sheet} sheet The spreadsheet to search in
 * @returns {TableBoundaries} Object with table boundaries
 */
function findMainTableBoundaries(sheet) {
    Logger.log("🔍 Looking for main table boundaries...");
    const data = sheet.getDataRange().getValues();
    let tableInfo = {
        headerRow: -1,
        startRow: -1,
        endRow: -1,
        columns: {}
    };

    // Find header row (looking for "Número")
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const numeroIndex = row.findIndex(cell => 
            normalizeString(String(cell)) === normalizeString(COLUMN_NAMES.numero));
        
        if (numeroIndex !== -1) {
            tableInfo.headerRow = i;
            // Map all column headers
            row.forEach((header, index) => {
                const normalizedHeader = normalizeString(String(header));
                Object.entries(COLUMN_NAMES).forEach(([key, value]) => {
                    if (normalizeString(value) === normalizedHeader) {
                        tableInfo.columns[key] = index;
                    }
                });
            });
            break;
        }
    }

    if (tableInfo.headerRow === -1) {
        Logger.log("❌ Could not find table headers");
        return null;
    }

    // Find last row with data
    tableInfo.startRow = tableInfo.headerRow + 1;
    for (let i = tableInfo.startRow; i < data.length; i++) {
        const numero = data[i][tableInfo.columns.numero];
        if (!numero) {
            tableInfo.endRow = i - 1;
            break;
        }
    }

    if (tableInfo.endRow === -1) {
        tableInfo.endRow = data.length - 1;
    }

    Logger.log(`📊 Table found: Rows ${tableInfo.startRow + 1} to ${tableInfo.endRow + 1}`);
    Logger.log(`📑 Columns found: ${Object.keys(tableInfo.columns).map(key => COLUMN_NAMES[key]).join(", ")}`);

    return new TableBoundaries(
        tableInfo.startRow + 1,
        tableInfo.endRow + 1,
        tableInfo.columns
    );
}

/**
 * Gets column values within the table boundaries
 */
function getColumnValues(columnKey) {
    const sheet = getSpreadsheet();
    const boundaries = findMainTableBoundaries(sheet);
    
    if (!boundaries) return null;
    
    const columnIndex = boundaries.columns[columnKey.toLowerCase()];
    if (columnIndex === undefined) {
        Logger.log(`❌ Column ${COLUMN_NAMES[columnKey]} not found`);
        return null;
    }

    const numRows = boundaries.endRow - boundaries.startRow + 1;
    const values = sheet.getRange(
        boundaries.startRow,
        columnIndex + 1,
        numRows,
        1
    ).getValues().flat();

    Logger.log(`📊 Retrieved ${values.length} values from column ${COLUMN_NAMES[columnKey]}`);
    return values;
}

/**
 * Gets multiple column values in a single operation
 */
function getTicketData() {
    const sheet = getSpreadsheet();
    const boundaries = findMainTableBoundaries(sheet);
    
    if (!boundaries) {
        Logger.log("❌ Could not find table boundaries");
        return null;
    }

    Logger.log("\n📊 Table information:");
    Logger.log(`   • Rows: ${boundaries.startRow} to ${boundaries.endRow}`);
    Logger.log(`   • Columns: ${Object.values(COLUMN_NAMES).join(", ")}`);

    const numRows = boundaries.endRow - boundaries.startRow + 1;
    return {
        numbers: sheet.getRange(boundaries.startRow, boundaries.columns.numero + 1, numRows, 1).getValues().flat(),
        shares: sheet.getRange(boundaries.startRow, boundaries.columns.decimos + 1, numRows, 1).getValues().flat(),
        notified: sheet.getRange(boundaries.startRow, boundaries.columns.notificado + 1, numRows, 1).getValues().flat()
    };
}

/**
 * Checks if a given ticket has a prize using the /check endpoint
 */
function checkTicketNumber(drawId, decimo) {
    if (MOCK_MODE) {
        Logger.log(`🧪 [MOCK] Checking ticket ${decimo}`);
        return MOCK_RESPONSES.check.data;
    }

    const url = `https://${API.BASE_URL}${API.ENDPOINTS.CHECK_TICKET}/${drawId}/${decimo}`;
    
    try {
        Logger.log(`🔍 Checking ticket ${decimo} at ${url}`);
        const response = UrlFetchApp.fetch(url, { 
            muteHttpExceptions: true,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.getResponseCode() !== 200) {
            Logger.log(`❌ API error: ${response.getResponseCode()}`);
            return null;
        }

        const result = JSON.parse(response.getContentText());
        return result.data;
    } catch (error) {
        Logger.log(`❌ Error checking ticket: ${error}`);
        return null;
    }
}

/**
 * Updates the ticket results using the ticket data and writes to the sheet.
 * @param {object} ticketData - Lottery data (mock or real) containing decimo and prize info.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Spreadsheet to write results to.
 */
function updateTicketResults(sheet) {
    Logger.log("\n🎟️ Starting ticket check process...");
    
    // Get celebration state first
    const celebrationState = getLotteryCelebrationState();
    const isDrawFinished = celebrationState?.data?.estadoCelebracionLNAC === false;
    
    Logger.log(`🎯 Draw status: ${isDrawFinished ? 'Finished' : 'In progress'}`);

    const tableData = getTicketData();
    if (!tableData) {
        Logger.log("❌ Could not retrieve ticket data");
        return;
    }

    const { numbers, shares, notified } = tableData;
    Logger.log(`📊 Processing ${numbers.length} tickets\n`);

    let stats = {
        checked: 0,
        winners: 0,
        newNotifications: 0,
        previouslyNotified: 0,
        totalPrize: 0
    };

    for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];
        if (!number) continue;
        
        stats.checked++;
        const wasNotified = notified[i] === "Yes";
        const paddedNumber = number.toString().padStart(5, '0');

        Logger.log(`🔍 Checking number ${paddedNumber} (notification status: ${wasNotified ? "notified" : "pending"})`);
        
        const result = checkTicketNumber(DRAW_CONFIG.ID, paddedNumber);

        // Get the cell to update
        const row = DRAW_CONFIG.AWARDS_START_ROW + i;
        const prizeCell = sheet.getRange(row, COLUMNS.AWARD_PER_SHARE + 1);

        if (result && result.isPremiado) {
            const share = shares[i] || 1;
            const totalPrize = result.prizeEuros * share;
            stats.winners++;
            stats.totalPrize += totalPrize;

            // Update spreadsheet with prize
            prizeCell.setValue(result.prizeEuros);

            if (!wasNotified) {
                Logger.log(`   💰 Winner! ${result.prizeEuros.toLocaleString()}€/decimo x ${share} tickets = ${totalPrize.toLocaleString()}€`);
                Logger.log(`   📧 Sending notification...`);
                notifyWinner(paddedNumber, result.prizeEuros, share);
                stats.newNotifications++;
            } else {
                Logger.log(`   💰 Winner already notified. ${result.prizeEuros.toLocaleString()}€/decimo x ${share} tickets = ${totalPrize.toLocaleString()}€`);
                stats.previouslyNotified++;
            }
        } else {
            Logger.log(`   ❌ No prize for this number`);
            // If draw is finished, set 0, otherwise set "?"
            if (isDrawFinished) {
                Logger.log(`   📝 Setting value to 0 (draw is finished)`);
                prizeCell.setValue(0);
            } else {
                Logger.log(`   📝 Setting value to ? (draw is in progress)`);
                prizeCell.setValue("?");
            }
        }
    }

    // Update status message with draw state
    const statusMessage = isDrawFinished 
        ? "Sorteo finalizado - Resultados definitivos" 
        : "Sorteo en curso - Resultados provisionales";
    updateStatus(true, false, statusMessage);

    // Print summary
    Logger.log("\n📊 Final Summary:");
    Logger.log(`   • Draw status: ${isDrawFinished ? 'Finished' : 'In progress'}`);
    Logger.log(`   • Numbers checked: ${stats.checked}`);
    Logger.log(`   • Winners found: ${stats.winners}`);
    Logger.log(`   • New notifications sent: ${stats.newNotifications}`);
    Logger.log(`   • Previously notified: ${stats.previouslyNotified}`);
    Logger.log(`   • Total prize money: ${stats.totalPrize.toLocaleString()}€`);
}

/**
 * Sends notification email to winner(s)
 */
function notifyWinner(number, prizePerShare, shares) {
    const sheet = getSpreadsheet();
    const notificationEmails = sheet.getRange("B7").getValue().toString();
    
    if (!notificationEmails) {
        Logger.log("❌ No notification email found in cell B7");
        return;
    }

    // Split emails and validate
    const emails = notificationEmails.split(',')
        .map(email => email.trim())
        .filter(email => email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
    
    if (emails.length === 0) {
        Logger.log("❌ No valid emails found");
        return;
    }

    if (emails.length > 5) {
        Logger.log("⚠️ Too many email addresses (max: 5). Using only the first 5.");
        emails.length = 5;
    }

    const totalPrize = prizePerShare * shares;
    
    try {
        MailApp.sendEmail({
            to: emails.join(','),
            subject: `🎉 ¡Premio de Lotería! Número ${number}`,
            htmlBody: `
                <h2>¡Enhorabuena! 🎊</h2>
                <p>Tu número <strong>${number}</strong> ha sido premiado.</p>
                <p>Detalles del premio:</p>
                <ul>
                    <li>Premio por décimo: ${prizePerShare.toLocaleString()}€</li>
                    <li>Número de décimos: ${shares}</li>
                    <li>Premio total: ${totalPrize.toLocaleString()}€</li>
                </ul>
                <p>¡Disfruta tu premio! 🎉</p>
            `
        });
        
        Logger.log(`📧 Notification sent to ${emails.length} recipient(s) for number ${number}`);
        
        // Mark as notified in the spreadsheet
        const row = findRowByNumber(number);
        if (row) {
            sheet.getRange(row, COLUMNS.NOTIFIED + 1).setValue("Yes");
        }
    } catch (error) {
        Logger.log(`❌ Error sending notification: ${error}`);
    }
}

/**
 * Finds the row number for a given lottery number
 */
function findRowByNumber(number) {
    const sheet = getSpreadsheet();
    const numbers = getColumn("Número");
    const index = numbers.findIndex(num => num.toString().padStart(5, '0') === number);
    return index >= 0 ? DRAW_CONFIG.AWARDS_START_ROW + index : null;
}

/**
 * Updates the status message in the spreadsheet
 */
function updateStatus(success = true, noData = false, customMessage = null) {
    const sheet = getSpreadsheet();
    if (!sheet) return;
    
    const timestamp = new Date().toLocaleString("es-ES", {timeZone: "Europe/Madrid"});
    let message;
    
    if (customMessage) {
        message = `${customMessage} - Última actualización: ${timestamp}`;
    } else if (noData) {
        message = `Sorteo pendiente - El sorteo comenzará el 22 de diciembre a las 9:00h - Última comprobación: ${timestamp}`;
    } else {
        message = success 
            ? `Resultados actualizados - Última actualización: ${timestamp}`
            : `Sorteo no disponible - Última comprobación: ${timestamp}`;
    }
    
    sheet.getRange("B5").setValue(message);
}

/**
 * Checks if the draw is still in celebration.
 * Returns true if we should continue updating, false if we should stop.
 */
function shouldContinueUpdating() {
  // Example: call your /api/lottery/state endpoint
  try {
    const url = "https://loteria-navidad-checker-production.up.railway.app/api/lottery/state";
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      Logger.log("Unable to fetch celebration state, defaulting to 'false'.");
      return false;
    }
    const data = JSON.parse(response.getContentText());
    return !!data.estadoCelebracionLNAC; 
  } catch (error) {
    Logger.log(`Error checking celebration state: ${error}`);
    return false;
  }
}

/**
 * Main function to update all lottery information
 */
async function updateLotteryInformation() {
    try {
        Logger.log("\n🎯 Starting lottery update process...");
        
        // Step 1: Check if we should stop the auto-update trigger
        if (!shouldContinueUpdating()) {
          Logger.log("Draw is not in celebration. Stopping auto-update...");
          stopAutoUpdate(false); 
        }

        const sheet = getSpreadsheet();
        if (!sheet) {
            showSheetNotFoundAlert();
            return;
        }
        
        Logger.log("📡 Fetching lottery data...");
        const data = await getLotteryData();
        
        if (!data || !data.resultsData || !data.ticketData) {
            Logger.log("ℹ️ No lottery data available");
            showLotteryNotAvailableAlert();
            updateStatus(false);
            return;
        }

        // Actualizar tabla de premios principales
        Logger.log("\n1️⃣ Updating main awards table...");
        await updateMainAwards(data.resultsData);

        // Procesar tickets individuales
        Logger.log("\n2️⃣ Processing individual tickets...");
        await updateTicketResults(sheet);

        Logger.log("\n✅ Update process completed successfully");
        updateStatus(true);

    } catch (error) {
        Logger.log(`❌ Error in updateLotteryInformation: ${error}`);
        console.error('Error in updateLotteryInformation:', error);
        showLotteryNotAvailableAlert();
        updateStatus(false);
    }
}

/**
 * Shows an alert when lottery results are not available
 */
function showLotteryNotAvailableAlert() {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
        '⏳ Sorteo no disponible',
        'No se ha podido conectar con el servicio de resultados.\n\n' +
        'Por favor, inténtalo de nuevo más tarde.',
        ui.ButtonSet.OK
    );
}

/**
 * Shows an alert when lottery draw hasn't started yet
 */
function showLotteryNotStartedAlert() {
    const ui = SpreadsheetApp.getUi();
    const currentYear = new Date().getFullYear().toString();
    
    ui.alert(
        '⏰ Sorteo pendiente',
        `El sorteo de Lotería de Navidad ${currentYear} aún no ha comenzado.\n\n` +
        'El sorteo se celebra el 22 de diciembre a partir de las 9:00h.\n' +
        'Durante el sorteo, los resultados se actualizarán automáticamente cada 5 minutos.\n\n' +
        'Puedes volver a comprobar manualmente usando el menú Loteria > Actualizar Resultados.',
        ui.ButtonSet.OK
    );
}

/**
 * Trigger function when spreadsheet is opened
 */
function onOpen() {
    Logger.log("🚀 Starting onOpen process...");
    
    try {
        // Create custom menu
        const ui = SpreadsheetApp.getUi();
        ui.createMenu("Loteria")
            .addItem("Actualizar Resultados", "updateLotteryInformation")
            .addItem("Enviar Notificaciones", "notifyIfWinner")
            .addSeparator()
            .addItem("Iniciar Actualización Automática", "startAutoUpdate")
            .addItem("Detener Actualización Automática", "stopAutoUpdate")
            .addSeparator()
            .addItem("Limpiar Cache", "clearApiCache")
            .addSeparator()
            .addItem("Ver Instrucciones", "showInstructions")
            .addToUi();
        Logger.log("📋 Custom menu created");

        // Check if sheet exists
        const ss = SpreadsheetApp.openById(SS_ID);
        const currentYear = new Date().getFullYear().toString();
        const sheet = ss.getSheetByName(currentYear);
        
        if (!sheet) {
            Logger.log(`⚠️ Sheet ${currentYear} not found, showing alert to user`);
            showSheetNotFoundAlert();
            return;
        }

        // If within lottery hours, set up auto-refresh
        if (isWithinLotteryHours()) {
            Logger.log("🕒 Within lottery hours, setting up auto-refresh");
            updateLotteryInformation();
            setupAutoRefresh();
            Logger.log("🔄 Auto-refresh enabled - Checking every 5 minutes during lottery hours");
        } else {
            Logger.log("ℹ️ Outside lottery hours, auto-refresh not needed");
        }

    } catch (error) {
        Logger.log(`❌ Error in onOpen: ${error}`);
        console.error('Error in onOpen:', error);
    }
}

/**
 * Gets the values of a column by its header name
 * @param {string} columnName The name of the column header
 * @returns {Array} The column values
 */
function getColumn(columnName) {
    const sheet = getSpreadsheet();
    const headers = sheet.getRange("A9:Z9").getValues()[0];
    const colIndex = headers.findIndex(header => 
        normalizeString(header) === normalizeString(columnName));

    if (colIndex === -1) {
        Logger.log(`Column ${columnName} not found`);
        return null;
    }

    const values = sheet.getRange(DRAW_CONFIG.AWARDS_START_ROW, colIndex + 1, 
        sheet.getLastRow() - DRAW_CONFIG.AWARDS_START_ROW + 1)
        .getValues()
        .flat();
    
    Logger.log(`Retrieved ${values.length} values from column ${columnName}: ${JSON.stringify(values)}`);
    return values;
}

/**
 * Normalizes a string by converting to lowercase and removing diacritics
 * @param {string} str The string to normalize
 * @returns {string} The normalized string
 */
function normalizeString(str) {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Checks if we're within lottery hours (9:00 AM - 3:00 PM Spain time on Dec 22)
 */
function isWithinLotteryHours() {
    const now = new Date();
    const spainTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
    
    return spainTime.getMonth() === 11 && // December
           spainTime.getDate() === 22 &&
           spainTime.getHours() >= 9 &&
           spainTime.getHours() < 15; // Until 3:00 PM
}

/**
 * Sets up automatic refresh during lottery hours
 */
function setupAutoRefresh() {
    if (!isWithinLotteryHours()) return;
    
    // Delete any existing triggers
    ScriptApp.getProjectTriggers().forEach(trigger => {
        if (trigger.getHandlerFunction() === 'updateLotteryInformation') {
            ScriptApp.deleteTrigger(trigger);
        }
    });
    
    // Create new trigger to run every 5 minutes during lottery hours
    ScriptApp.newTrigger('updateLotteryInformation')
        .timeBased()
        .everyMinutes(5)
        .create();
}

/**
 * Creates the Instructions sheet if it doesn't exist
 */
function createInstructionsSheet() {
    const ss = SpreadsheetApp.openById(SS_ID);
    let instructionsSheet = ss.getSheetByName("Instructions");
    
    if (!instructionsSheet) {
        instructionsSheet = ss.insertSheet("Instructions", 0);
        
        // Basic formatting
        instructionsSheet.setColumnWidth(1, 50);  // A
        instructionsSheet.setColumnWidth(2, 600); // B
        
        // Content
        const instructions = [
            ["🎯", "How to use this spreadsheet"],
            ["1️⃣", "The spreadsheet will automatically check for lottery results on December 22nd between 9:00 AM and 2:00 PM (Spain time)"],
            ["2️⃣", "Your lottery numbers should be entered in the year tab (e.g., '2024')"],
            ["3️⃣", "Required columns:"],
            ["", "• Número: Your lottery number"],
            ["", "• Decimos: Number of tickets for that number"],
            ["", "• Quien: Who bought it"],
            ["", "• Para: Who it's for"],
            ["", "• Notificado: Will be automatically updated when winners are notified"],
            ["4️⃣", "Email notifications will be sent to the address specified in cell B7"],
            ["5️⃣", "You can manually update results using the 'Loteria' menu > 'Update Results'"],
            ["⚠️", "Important notes:"],
            ["", "• The spreadsheet automatically updates when opened during lottery hours"],
            ["", "• Notifications are only sent once per winning number"],
            ["", "• All amounts are in Euros (€)"]
        ];
        
        instructionsSheet.getRange(1, 1, instructions.length, 2).setValues(instructions);
        
        // Formatting
        instructionsSheet.getRange("A1:B1").setFontWeight("bold");
        instructionsSheet.getRange("A:B").setWrap(true);
    }
}

/**
 * Clears the API cache
 */
function clearApiCache() {
    Logger.log("🧹 Clearing API cache...");
    try {
        const response = UrlFetchApp.fetch(`https://${API.BASE_URL}/api/lottery/clearcache`);
        if (response.getResponseCode() === 200) {
            Logger.log("✅ Cache cleared successfully");
            SpreadsheetApp.getUi().alert(
                '✅ Cache limpiado',
                'El cache ha sido limpiado correctamente.',
                SpreadsheetApp.getUi().ButtonSet.OK
            );
        }
    } catch (error) {
        Logger.log(`❌ Error clearing cache: ${error}`);
        SpreadsheetApp.getUi().alert(
            '❌ Error',
            'No se pudo limpiar el cache. Por favor, inténtalo de nuevo más tarde.',
            SpreadsheetApp.getUi().ButtonSet.OK
        );
    }
}

/**
 * Starts automatic update process
 */
function startAutoUpdate() {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
        '🔄 Iniciar actualización automática',
        'Esto iniciará la actualización automática cada 5 minutos.\n\n' +
        '¿Deseas continuar?',
        ui.ButtonSet.YES_NO
    );

    if (response === ui.Button.YES) {
        // Delete any existing triggers first
        stopAutoUpdate(false);
        
        // Create new trigger
        ScriptApp.newTrigger('updateLotteryInformation')
            .timeBased()
            .everyMinutes(5)
            .create();
        
        Logger.log("🔄 Auto-update started - Checking every 5 minutes");
        ui.alert(
            '✅ Actualización automática iniciada',
            'Los resultados se actualizarán automáticamente cada 5 minutos.\n\n' +
            'Puedes detener el proceso en cualquier momento desde el menú.',
            ui.ButtonSet.OK
        );
    }
}

/**
 * Stops automatic update process
 * @param {boolean} showAlert Whether to show a confirmation alert
 */
function stopAutoUpdate(showAlert = true) {
    // Delete all updateLotteryInformation triggers
    ScriptApp.getProjectTriggers().forEach(trigger => {
        if (trigger.getHandlerFunction() === 'updateLotteryInformation') {
            ScriptApp.deleteTrigger(trigger);
        }
    });
    
    Logger.log("⏹️ Auto-update stopped");
    
    if (showAlert) {
        SpreadsheetApp.getUi().alert(
            '⏹️ Actualización automática detenida',
            'Se ha detenido el proceso de actualización automática.',
            SpreadsheetApp.getUi().ButtonSet.OK
        );
    }
}

/**
 * Gets the lottery celebration state
 */
function getLotteryCelebrationState() {
    if (MOCK_MODE) {
        return {
            data: {
                estadoCelebracionLNAC: false, // false means sorteo finished
                message: "Sorteo finalizado [MOCK]"
            }
        };
    }

    const url = `https://${API.BASE_URL}/api/lottery/state`;
    
    try {
        const response = UrlFetchApp.fetch(url, { 
            muteHttpExceptions: true,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.getResponseCode() !== 200) {
            Logger.log(`❌ Error getting celebration state: ${response.getResponseCode()}`);
            // If we can't get the state, assume the draw is finished (safer option)
            return { data: { estadoCelebracionLNAC: false } };
        }

        const result = JSON.parse(response.getContentText());
        
        // Check if result has the expected structure
        if (!result || !result.data || typeof result.data.estadoCelebracionLNAC !== 'boolean') {
            Logger.log(`⚠️ Unexpected API response format: ${JSON.stringify(result)}`);
            // Default to finished state if format is unexpected
            return { data: { estadoCelebracionLNAC: false } };
        }

        Logger.log(`🎯 Draw celebration state: ${result.data.estadoCelebracionLNAC ? "In progress" : "Finished"}`);
        return result;
    } catch (error) {
        Logger.log(`❌ Error getting celebration state: ${error}`);
        // If there's an error, assume the draw is finished (safer option)
        return { data: { estadoCelebracionLNAC: false } };
    }
}