import ProcessController from "../structures/ProcessController.js";
import AppError from "../utils/appError.js";
import { processStatus } from "../utils/constants.js";
import { sendResponse } from "../utils/sendResponse.js";

export const getProcesses = (req, res) => {
  const processes = ProcessController.getAllProcesses();
  sendResponse(req, res, processes);
};

export const removeProcess = (req, res) => {
  const process = ProcessController.getProcess(req.params.processId);

  if (!process) throw new AppError("Process not found", 404);

  if (
    process.status !== processStatus.Completed &&
    process.status !== processStatus.Errored
  )
    throw new AppError("Process not completed yet", 400);

  ProcessController.deleteProcess(req.params.processId);

  sendResponse(req, res, undefined);
};
