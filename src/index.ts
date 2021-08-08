import express from 'express';
import Shopify, { ApiVersion,AuthQuery, DataType } from '@shopify/shopify-api';
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const app = express();
const cdirectory = path.resolve();
const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env;

Shopify.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST,
  IS_EMBEDDED_APP: true,
  API_VERSION: ApiVersion.October20 // all supported versions are available, as well as "unstable" and "unversioned"
});

app.get('/login', async (req, res) => {
    let authRoute = await Shopify.Auth.beginAuth(
      req,
      res,
      SHOP,
      '/auth/callback',
      true,
    );
    return res.redirect(authRoute);
  });

  app.get('/auth/callback', async (req, res) => {
    try {
      await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query as unknown as AuthQuery,
      ); // req.query must be cast to unkown and then AuthQuery in order to be accepted
    } catch (error) {
      console.error(error); // in practice these should be handled more gracefully
    }
    
    return res.redirect('/'); // wherever you want your user to end up after OAuth completes
  }); 

  app.get('/', async (req, res)=> {
   
      res.send("Authentication Complete");
  })

  app.get('/email', async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res);
    // Create a new client for the specified shop.
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    // Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
    const shops = await client.get({
      path: 'shop',
      type: DataType.JSON,
    });
    
    res.json(shops);
    console.log(shops);
    
  })

  app.get('/productpost', async(req, res) =>{
    //   res.send("Product Posted");
    const session = await Shopify.Utils.loadCurrentSession(req, res);
    // Create a new client for the specified shop.
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    // Build your post request body.
    const body = {
        "product": {
          "title": "Burton Custom",
          "body_html": "<strong>Good snowboard!</strong>",
          "vendor": "John Doe",
          "product_type": "Snowboard",
          "status": "draft"
        }
      }

    // Use `client.post` to send your request to the specified Shopify REST API endpoint.
    const response = await client.post({
      path: 'products',
      data: body,
      type: DataType.JSON,
    });
    res.send("Product Posted");
      console.log(response);
  });

app.listen(3000, () => {
  console.log('your app is now listening on port 3000');
});