function normalizeResults(rawData) {
  if (!rawData || !rawData.compruebe) return rawData;

  const newCompruebe = rawData.compruebe.map((item) => {
    let displayPrize = item.prize;
    let isReintegro = false;

    if (item.prizeType === "R" && item.prize === 2000) {
      displayPrize = 20;
      isReintegro = true;
    }

    return {
      ...item,
      displayPrize,
      isReintegro,
    };
  });

  return {
    ...rawData,
    compruebe: newCompruebe,
  };
}

function createApiError(status, text) {
  const error = new Error(`HTTP error! status: ${status}`);
  error.status = status;
  error.responseText = text.substring(0, 200);
  return error;
}

function logApiResponse(logger, requestId, response, responseText) {
  logger.debug(
    {
      requestId,
      responseHeaders: JSON.stringify(response.headers),
      responseBodyTruncated: responseText.substring(0, 200),
    },
    "API Response received"
  );
}

function handleApiError(logger, error, requestId, operationType) {
  logger.error({
    requestId,
    message: `Error retrieving ${operationType}`,
    error: {
      message: error.message,
      stack: error.stack,
      status: error.status,
      responseText: error.responseText,
    },
  });
}

module.exports = {
  normalizeResults,
  createApiError,
  logApiResponse,
  handleApiError,
};
