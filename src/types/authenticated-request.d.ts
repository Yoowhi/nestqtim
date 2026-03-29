import { Request } from "express";
import { UserInfo } from "./user-info";

export interface AuthenticatedRequest extends Request {
    user: UserInfo
}