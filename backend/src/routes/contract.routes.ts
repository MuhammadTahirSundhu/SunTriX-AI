import { Router, Request, Response, NextFunction } from "express";
import { contractService } from "../modules/contracts/contract.service";
import { validate, ContractSignSchema } from "../middleware/validate";

const router = Router();

// GET /contracts/:token — PUBLIC client views contract
router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await contractService.getByToken(req.params.token);
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

// POST /contracts/:token/sign — PUBLIC client signs contract
router.post("/:token/sign", validate(ContractSignSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || "";

    const result = await contractService.signContract({
      token: req.params.token,
      clientSignatureName: req.body.clientSignatureName,
      clientIp,
      userAgent,
    });

    res.json({
      message: "Contract signed successfully! Your project workspace has been set up.",
      contract: result.contract,
      trackerToken: result.trackerToken,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
