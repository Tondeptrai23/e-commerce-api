import { afterAll, afterEach, beforeAll, jest } from "@jest/globals";
import { s3 } from "../config/aws.config.js";
import MailService from "../services/users/mail.service.js";
import { db } from "../models/index.model.js";

beforeAll(() => {
    jest.setTimeout(30000); // 30 seconds

    // Mock AWS SDK
    jest.spyOn(s3, "putObject").mockImplementation(() => {
        return {
            promise: jest.fn().mockResolvedValue(),
        };
    });

    jest.spyOn(s3, "deleteObject").mockImplementation(() => {
        return {
            promise: jest.fn().mockResolvedValue(),
        };
    });

    // Mock MailService
    jest.spyOn(MailService, "sendResetPasswordEmail").mockResolvedValue();

    jest.spyOn(MailService, "sendVerificationEmail").mockResolvedValue();

    jest.spyOn(MailService, "sendPasswordIsChangedEmail").mockResolvedValue();

    jest.spyOn(MailService, "sendOrderConfirmationEmail").mockResolvedValue();

    jest.spyOn(MailService, "sendOrderFailedEmail").mockResolvedValue();
});

afterAll(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await db.close();
});

afterEach(() => {
    jest.clearAllTimers();
});
