import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../../../../../app.js";
import seedData from "../../../../../seedData.js";
import {
    assertNotAnAdmin,
    assertTokenInvalid,
    assertTokenNotProvided,
} from "../../utils.integration.js";
import { db } from "../../../../../models/index.model.js";

/**
 * Set up
 */
let accessToken = "";
let accessTokenUser = "";
beforeAll(async () => {
    // Seed data
    await seedData();

    // Get access token
    const res = await request(app).post("/api/v2/auth/signin").send({
        email: "admin@gmail.com",
        password: "adminpassword",
    });
    accessToken = res.body.accessToken;

    const resUser = await request(app).post("/api/v2/auth/signin").send({
        email: "user1@gmail.com",
        password: "password1",
    });
    accessTokenUser = resUser.body.accessToken;
});

afterAll(async () => {
    await db.close();
    accessToken = null;
    accessTokenUser = null;
});

/**
 * Tests
 */
describe("DELETE /api/v2/admin/variants/:variantID", () => {
    it("should delete a variant", async () => {
        const res = await request(app)
            .delete("/api/v2/admin/variants/101")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(StatusCodes.OK);
        expect(res.body).toEqual({
            success: true,
        });

        const res2 = await request(app)
            .get("/api/v2/admin/variants/101")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res2.statusCode).toEqual(StatusCodes.OK);
        expect(res2.body).toEqual({
            success: true,
            variant: expect.objectContaining({
                variantID: "101",
                deletedAt: expect.any(String),
            }),
        });

        const res3 = await request(app).get("/api/v2/products/1/variants");

        expect(res3.statusCode).toEqual(StatusCodes.OK);
        expect(res3.body).toEqual({
            success: true,
            variants: expect.any(Array),
        });
        expect(res3.body.variants.some((v) => v.variantID === "101")).toBe(
            false
        );
    });

    it("should return 404 if variant not found", async () => {
        const res = await request(app)
            .delete("/api/v2/admin/variants/999")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(StatusCodes.NOT_FOUND);
        expect(res.body).toEqual(expect.objectContaining({ success: false }));
    });

    it("should return 401 if token is not provided", async () => {
        const res = await request(app).delete("/api/v2/admin/variants/101");

        assertTokenNotProvided(res);
    });

    it("should return 401 if token is invalid", async () => {
        const res = await request(app)
            .delete("/api/v2/admin/variants/101")
            .set("Authorization", "Bearer invalidtoken");

        assertTokenInvalid(res);
    });

    it("should return 403 if user is not an admin", async () => {
        const res = await request(app)
            .delete("/api/v2/admin/variants/101")
            .set("Authorization", `Bearer ${accessTokenUser}`);

        assertNotAnAdmin(res);
    });
});
