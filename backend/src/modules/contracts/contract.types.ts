import { IContract } from "../../models/Contract";

export { IContract };

export interface SignContractDTO {
  token: string;
  clientSignatureName: string;
  clientIp?: string;
  userAgent?: string;
}
