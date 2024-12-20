import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "../../../../../../app.js";
import seedData from "../../../../../../seedData.js";
import {
    assertNotAnAdmin,
    assertTokenInvalid,
    assertTokenNotProvided,
} from "../../../utils.integration.js";
import ProductImage from "../../../../../../models/products/productImage.model.js";
import path from "path";
import { db } from "../../../../../../models/index.model.js";

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
describe("POST /admin/products/:productID/variants", () => {
    it("should create a variant", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku1",
                    },
                ],
            });

        expect(res.statusCode).toEqual(StatusCodes.CREATED);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                variants: expect.any(Array),
            })
        );

        expect(res.body.variants[0]).toEqual(
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku1",
                productID: "1",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        );
    });

    it("should create a variant 2", async () => {
        const variantData = [
            {
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku2",
            },
        ];

        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .field("variants", JSON.stringify(variantData))
            .attach("images", path.resolve(process.cwd(), "db_diagram.png"));

        expect(res.statusCode).toEqual(StatusCodes.CREATED);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                variants: expect.any(Array),
            })
        );

        expect(res.body.variants[0]).toEqual(
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku2",
                imageID: null,
                productID: "1",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        );
    });

    it("should create a variant 3", async () => {
        const variantData = [
            {
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku3",
                imageIndex: 0,
                attributes: {
                    color: "red",
                    size: "S",
                },
            },
        ];

        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .field("variants", JSON.stringify(variantData))
            .attach("images", path.resolve(process.cwd(), "db_diagram.png"));

        expect(res.statusCode).toEqual(StatusCodes.CREATED);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                variants: expect.any(Array),
            })
        );

        expect(res.body.variants[0]).toEqual(
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku3",
                imageID: expect.any(String),
                productID: "1",
                attributes: expect.objectContaining({
                    color: "red",
                    size: "S",
                }),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        );

        const image = await ProductImage.findOne({
            where: {
                imageID: res.body.variants[0].imageID,
            },
        });
        expect(image).toEqual(
            expect.objectContaining({
                imageID: expect.any(String),
                contentType: "image/png",
                displayOrder: expect.any(Number),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            })
        );
    });

    it("should create variants", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku4",
                    },
                    {
                        name: "variant2",
                        price: 200,
                        discountPrice: 120,
                        stock: 20,
                        sku: "sku5",
                    },
                ],
            });

        expect(res.statusCode).toEqual(StatusCodes.CREATED);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                variants: expect.any(Array),
            })
        );

        expect(res.body.variants[0]).toEqual(
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku4",
                productID: "1",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            }),
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant2",
                price: 200,
                discountPrice: 120,
                stock: 20,
                sku: "sku5",
                productID: "1",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        );
    });

    it("should create variants 2", async () => {
        const variantData = [
            {
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku6",
                imageIndex: 0,
                attributes: {
                    color: "red",
                    size: "S",
                },
            },
            {
                name: "variant2",
                price: 200,
                discountPrice: 120,
                stock: 20,
                sku: "sku7",
                imageIndex: 1,
                attributes: {
                    color: "blue",
                    size: "M",
                },
            },
        ];

        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .field("variants", JSON.stringify(variantData))
            .attach("images", path.resolve(process.cwd(), "db_diagram.png"))
            .attach("images", path.resolve(process.cwd(), "db_diagram.png"));

        expect(res.statusCode).toEqual(StatusCodes.CREATED);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                variants: expect.any(Array),
            })
        );

        expect(res.body.variants[0]).toEqual(
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant1",
                price: 100,
                stock: 10,
                sku: "sku6",
                productID: "1",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            }),
            expect.objectContaining({
                variantID: expect.any(String),
                name: "variant2",
                price: 200,
                discountPrice: 120,
                stock: 20,
                sku: "sku7",
                productID: "1",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        );

        const image1 = await ProductImage.findOne({
            where: {
                imageID: res.body.variants[0].imageID,
            },
        });
        expect(image1).not.toBeNull();

        const image2 = await ProductImage.findOne({
            where: {
                imageID: res.body.variants[1].imageID,
            },
        });
        expect(image2).not.toBeNull();

        expect(res.body.variants[0].attributes).toEqual(
            expect.objectContaining({
                color: "red",
                size: "S",
            })
        );

        expect(res.body.variants[1].attributes).toEqual(
            expect.objectContaining({
                color: "blue",
                size: "M",
            })
        );
    });

    it("should return 409 if sku is taken", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku1",
                    },
                ],
            });

        expect(res.statusCode).toEqual(StatusCodes.CONFLICT);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
            })
        );
    });

    it("should return 400 if price is missing", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        stock: 10,
                        sku: "sku7",
                    },
                ],
            });

        expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
            })
        );
    });

    it("should return 403 if not an admin", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessTokenUser}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku7",
                    },
                ],
            });

        assertNotAnAdmin(res);
    });

    it("should return 401 if token is invalid", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .set("Authorization", `Bearer ${accessToken.slice(0, -1)}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku7",
                    },
                ],
            });

        assertTokenInvalid(res);
    });

    it("should return 401 if token is not provided", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/1/variants")
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku7",
                    },
                ],
            });

        assertTokenNotProvided(res);
    });

    it("should return 404 if product is not found", async () => {
        const res = await request(app)
            .post("/api/v2/admin/products/100/variants")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                variants: [
                    {
                        name: "variant1",
                        price: 100,
                        stock: 10,
                        sku: "sku7",
                    },
                ],
            });

        expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(res.body).toEqual(
            expect.objectContaining({
                success: false,
            })
        );
    });
});
