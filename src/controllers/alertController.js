import AppError from "../utils/appError.js";
import { sendResponse } from "../utils/sendResponse.js";

export const saveAlert = async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);

  sendResponse(req, res, {});
};
