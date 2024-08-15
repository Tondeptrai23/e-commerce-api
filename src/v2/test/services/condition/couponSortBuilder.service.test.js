import CouponSortBuilder from "../../../services/condition/couponSortBuilder.service.js";

describe("CouponSortBuilder", () => {
    test("should return an array with default sorting if the query is empty", () => {
        const query = {};
        const sortBuilder = new CouponSortBuilder(query);
        const result = sortBuilder.build();
        expect(result).toEqual([["createdAt", "ASC"]]);
    });

    test("should return an array with default sorting if the sort field is not array", () => {
        const query = { sort: "discountValue" };
        const sortBuilder = new CouponSortBuilder(query);
        const result = sortBuilder.build();
        expect(result).toEqual([["createdAt", "ASC"]]);
    });

    test("should return an array of order conditions compatible for Sequelize sorting", () => {
        const query = { sort: ["discountValue"] };
        const sortBuilder = new CouponSortBuilder(query);
        const result = sortBuilder.build();
        expect(result).toEqual([
            ["discountValue", "ASC"],
            ["createdAt", "ASC"],
        ]);
    });

    test("should return an array of order conditions compatible for Sequelize sorting with multiple fields and directions", () => {
        const query = { sort: ["-discountValue", "timesUsed"] };
        const sortBuilder = new CouponSortBuilder(query);
        const result = sortBuilder.build();
        expect(result).toEqual([
            ["discountValue", "DESC"],
            ["timesUsed", "ASC"],
            ["createdAt", "ASC"],
        ]);
    });

    test("should return an array of order conditions compatible for Sequelize sorting with multiple fields and directions", () => {
        const query = {
            sort: ["-discountValue", "-timesUsed", "createdAt", "-endDate"],
        };
        const sortBuilder = new CouponSortBuilder(query);
        const result = sortBuilder.build();
        expect(result).toEqual([
            ["discountValue", "DESC"],
            ["timesUsed", "DESC"],
            ["createdAt", "ASC"],
            ["endDate", "DESC"],
            ["createdAt", "ASC"],
        ]);
    });
});
