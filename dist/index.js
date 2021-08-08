"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shopify_api_1 = __importStar(require("@shopify/shopify-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = express_1.default();
const cdirectory = path_1.default.resolve();
const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env;
shopify_api_1.default.Context.initialize({
    API_KEY,
    API_SECRET_KEY,
    SCOPES: [SCOPES],
    HOST_NAME: HOST,
    IS_EMBEDDED_APP: true,
    API_VERSION: shopify_api_1.ApiVersion.October20 // all supported versions are available, as well as "unstable" and "unversioned"
});
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let authRoute = yield shopify_api_1.default.Auth.beginAuth(req, res, SHOP, '/auth/callback', true);
    return res.redirect(authRoute);
}));
app.get('/auth/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield shopify_api_1.default.Auth.validateAuthCallback(req, res, req.query); // req.query must be cast to unkown and then AuthQuery in order to be accepted
    }
    catch (error) {
        console.error(error); // in practice these should be handled more gracefully
    }
    return res.redirect('/'); // wherever you want your user to end up after OAuth completes
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Authentication Complete");
}));
app.get('/email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield shopify_api_1.default.Utils.loadCurrentSession(req, res);
    // Create a new client for the specified shop.
    const client = new shopify_api_1.default.Clients.Rest(session.shop, session.accessToken);
    // Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
    const shops = yield client.get({
        path: 'shop',
        type: shopify_api_1.DataType.JSON,
    });
    res.json(shops);
    console.log(shops);
}));
app.get('/productpost', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   res.send("Product Posted");
    const session = yield shopify_api_1.default.Utils.loadCurrentSession(req, res);
    // Create a new client for the specified shop.
    const client = new shopify_api_1.default.Clients.Rest(session.shop, session.accessToken);
    // Build your post request body.
    const body = {
        "product": {
            "title": "Burton Custom",
            "body_html": "<strong>Good snowboard!</strong>",
            "vendor": "John Doe",
            "product_type": "Snowboard",
            "status": "draft"
        }
    };
    // Use `client.post` to send your request to the specified Shopify REST API endpoint.
    const response = yield client.post({
        path: 'products',
        data: body,
        type: shopify_api_1.DataType.JSON,
    });
    res.send("Product Posted");
    console.log(response);
}));
app.listen(3000, () => {
    console.log('your app is now listening on port 3000');
});
//# sourceMappingURL=index.js.map