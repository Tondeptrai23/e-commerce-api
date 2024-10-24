import Entity from "./index.serializer.service.js";

const UserSerializer = new Entity({
    userID: {
        type: "string",
        required: true,
    },
    email: {
        type: "string",
    },
    name: {
        type: "string",
    },
    role: {
        type: "string",
    },
    isVerified: {
        type: "boolean",
    },
    createdAt: [
        {
            type: "date",
            format: "iso",
        },
        function (obj, options) {
            if (options.includeTimestamps) {
                return obj.createdAt;
            }
            return undefined;
        },
    ],
    updatedAt: [
        {
            type: "date",
            format: "iso",
        },
        function (obj, options) {
            if (options.includeTimestamps) {
                return obj.updatedAt;
            }
            return undefined;
        },
    ],
    deletedAt: [
        {
            type: "date",
            format: "iso",
        },
        function (obj, options) {
            if (options.includeTimestamps) {
                return obj.deletedAt;
            }
            return undefined;
        },
    ],
});

export default UserSerializer;
