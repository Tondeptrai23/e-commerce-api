import Product from "../../models/products/product.model.js";
import Category from "../../models/products/category.model.js";
import ProductImage from "../../models/products/productImage.model.js";
import { Op } from "sequelize";
import { removeEmptyFields } from "../../utils/utils.js";
import variantService from "./variant.service.js";
import { ResourceNotFoundError } from "../../utils/error.js";
import { db } from "../../models/index.model.js";
import ProductCategory from "../../models/products/productCategory.model.js";

class ProductBuilderService {
    /**
     * Create a product builder object that can be used to create a product
     * or add variants, categories, and images to an existing product.
     *
     * @param {String} productID the product ID to be retrieved
     * @returns {Promise<Object>} the product builder object
     * @throws {ResourceNotFoundError} if the productID is provided but the product is not found
     */
    async productBuilder(productID = null) {
        let product = null;
        if (productID) {
            product = await Product.findByPk(productID);
            if (!product) {
                throw new ResourceNotFoundError("Product not found");
            }
        }

        return {
            product: product,
            variants: null,
            categories: null,
            images: null,

            /**
             * Set the product info for the product builder
             * Should be called first when creating a new product
             *
             * @param {Object} productInfo the product info to be set
             * @returns {Promise<Object>} this product builder object
             */
            async setProductInfo(productInfo) {
                if (!productInfo) {
                    return this;
                }

                const productData = await Product.create(productInfo);
                this.product = productData;
                return this;
            },

            /**
             * Set the categories for the product builder
             * Should be called after setProductInfo
             *
             * @param {Array<String>} categories the array of category names to be set
             * @returns {Promise<Object>} this product builder object
             */
            async setCategories(categories) {
                if (!categories) {
                    return this;
                }

                // Get the categories
                const categoriesObj = await Category.findAll({
                    where: {
                        name: {
                            [Op.in]: categories,
                        },
                    },
                });

                // Get the existing category IDs in the product
                const existingCategoryIDs = (
                    await ProductCategory.findAll({
                        where: {
                            productID: this.product.productID,
                        },
                        attributes: ["categoryID"],
                    })
                ).map((category) => category.categoryID);

                const newCategories = categoriesObj.filter((category) => {
                    return !existingCategoryIDs.includes(category.categoryID);
                });

                // Add the new categories
                await ProductCategory.bulkCreate(
                    newCategories.map((category) => {
                        return {
                            productID: this.product.productID,
                            categoryID: category.categoryID,
                        };
                    })
                );

                this.categories = newCategories;

                return this;
            },

            /**
             * Set the images for the product builder
             * Should be called after setProductInfo
             *
             * @param {Array<Object>} images the images to be set
             * @returns {Promise<Object>} this product builder object
             */
            async setImages(images) {
                if (!images) {
                    return this;
                }

                images = images.map((image) => {
                    return {
                        url: image.url,
                        altText: image.altText,
                        productID: this.product.productID,
                    };
                });

                images = await ProductImage.bulkCreate(images);

                this.images = images;
                return this;
            },

            /**
             * Set the variants for the product builder
             * Shoudld be called after setImages and setProductInfo
             *
             * @param {Array<Object>} variants the variants info to be set
             * @returns {Promise<Object>} this product builder object
             */
            async setVariants(variants) {
                if (!variants) {
                    return this;
                }

                const newVariants = [];
                for (const variant of variants) {
                    const { imageIndex, ...rest } = variant;

                    let newVariant =
                        await variantService.createVariantForProduct(
                            this.product,
                            rest
                        );

                    if (this.images && this.images[imageIndex]) {
                        newVariant = await newVariant.update({
                            imageID: this.images[imageIndex].imageID,
                        });
                    }

                    newVariants.push(newVariant);
                }

                this.variants = newVariants;

                return this;
            },

            /**
             * Build the product object
             * Should be called last
             *
             * @returns {Promise<Object>} the product builder object
             */
            async build() {
                let result = {
                    ...JSON.parse(JSON.stringify(this.product)),
                    variants: this.variants,
                    images: this.images,
                    categories: this.categories,
                };

                result = removeEmptyFields(result);

                // Clean up
                this.product = null;
                this.variants = null;
                this.categories = null;
                this.images = null;

                return result;
            },
        };
    }

    /**
     * Create a new product with the given info
     *
     * @param {Object} productInfo the product info to be set
     * @param {Array<Object>} variants the variants info to be set
     * @param {Array<String>} categories the array of category names to be set
     * @param {Array<Object>} images the images info to be set
     * @returns {Promise<Product>} the product object
     * @throws {ResourceNotFoundError} if the product is not found
     *
     */
    async addProduct(productInfo, variants, categories, images) {
        return await db
            .transaction(async (t) => {
                let builder = await this.productBuilder(null);
                builder = await builder.setProductInfo(productInfo);
                builder = await builder.setImages(images);
                builder = await builder.setVariants(variants);
                builder = await builder.setCategories(categories);

                return await builder.build();
            })
            .catch(async (err) => {
                throw err;
            });
    }

    /**
     * Add an image to a product
     *
     * @param {String} productID the product ID to be updated
     * @param {Object} imageData the image data to be added
     * @returns {Promise<Product>} the product with the new image added
     * @throws {ResourceNotFoundError} if the product is not found
     */
    async addImages(productID, imagesData) {
        return await db
            .transaction(async (t) => {
                let builder = await this.productBuilder(productID);
                builder = await builder.setImages(imagesData);
                const product = await builder.build();

                return product;
            })
            .catch(async (err) => {
                throw err;
            });
    }

    /**
     * Add a variant to a product
     *
     * @param {String} productID the product ID to be updated
     * @param {Object} variants the variants to be added
     * @returns {Promise<Product>} the product with the new variants added
     * @throws {ResourceNotFoundError} if the product is not found
     */
    async addVariants(productID, variants) {
        return await db
            .transaction(async (t) => {
                let builder = await this.productBuilder(productID);

                // Preprocess
                const { images, variants: newVariants } = variants.reduce(
                    (acc, variant) => {
                        if (variant.image) {
                            acc.images.push(variant.image);
                            variant.imageIndex = acc.images.length - 1;
                            delete variant.image;
                        }
                        acc.variants.push(variant);
                        return acc;
                    },
                    { images: [], variants: [] }
                );

                builder = await builder.setImages(images);
                builder = await builder.setVariants(newVariants);
                const product = await builder.build();

                return product;
            })
            .catch((err) => {
                throw err;
            });
    }

    /**
     * Add the categories to a product
     *
     * @param {String} productID the product ID to be updated
     * @param {Array<String>} categories the array of category names to be set
     * @returns {Promise<Product>} the updated product
     * @throws {ResourceNotFoundError} if the product is not found
     */
    async addCategories(productID, categories) {
        return await db
            .transaction(async (t) => {
                let builder = await this.productBuilder(productID);
                builder = await builder.setCategories(categories);
                const product = await builder.build();

                return product;
            })
            .catch((err) => {
                throw err;
            });
    }
}

export default new ProductBuilderService();
