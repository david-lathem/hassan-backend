import { COMMAND_MAP } from "./constants.js";

export const parseTradeMessage = (input) => {
  let commandKey = "";

  const firstTwo = input.slice(0, 2).toUpperCase();
  const firstOne = input.slice(0, 1).toUpperCase();

  if (COMMAND_MAP[firstTwo]) {
    commandKey = firstTwo;
  } else if (COMMAND_MAP[firstOne]) {
    commandKey = firstOne;
  } else {
    return null;
  }

  const rest = input.slice(commandKey.length);

  const match = rest.match(/^([A-Z]*)(\d+[CP])([\d.]+)$/i);

  console.log(match);

  if (!match) return null;

  const [, ticker, contract, price] = match;

  // If ticker is missing, just skip it (for S / SPX commands)
  const tickerFinal = ticker ? `${ticker.toUpperCase()} ` : "";

  return `**${COMMAND_MAP[commandKey]} ${tickerFinal}${contract.toUpperCase()} at $${price}**`;
};
