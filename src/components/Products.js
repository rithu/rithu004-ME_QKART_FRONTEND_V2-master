import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { Button } from "@mui/material";
import ProductCard from "./ProductCard";

import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import Cart, { generateCartItemsFrom } from "./Cart";
import "./Products.css";
import { Token } from "@mui/icons-material";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  // localStorage.clear();
  const { enqueueSnackbar } = useSnackbar();
  const [productsObj, setProductsObj] = useState([]);

  const [productLoading, setProductLoading] = useState(false);
  const [searchNullResult, setSearchNullResult] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [cartData, setCartData] = useState([]);
  // const [cartFullData,setCartFullData] = useState([]);
  const [itemsInCart, setItemsInCart] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  let loginCred = localStorage.getItem("username");
  const token = localStorage.getItem("token");


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setProductLoading(true);
    try {
      const productsData = await axios(config.endpoint + "/products");
      
      productsData !== undefined
        ? setProductsObj(productsData.data)
        : setProductLoading(true);
      
      setProductLoading(false);
    } catch (e) {
      
      setProductLoading(false);
      if (e.response.status >= 400 && e.response.status < 500)
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      else
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setProductLoading(true);
    try {
      const filteredData = await axios(
        config.endpoint + "/products/search?value=" + text
      );
      setProductsObj(filteredData.data);
      
      setProductLoading(false);
      setSearchNullResult(false);
    } catch (e) {
      setProductLoading(false);
      if (e.response.status === 404) {
        setProductsObj([]);
        
        setSearchNullResult(true);
        enqueueSnackbar("no products found", { variant: "warning" });
      } else if (e.response.status >= 400 && e.response.status < 500)
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      else
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timer = setTimeout(() => {
      performSearch(event.target.value);
    }, 500);
    setDebounceTimeout(timer);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */

  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const fetchedCart = await axios.get(config.endpoint + "/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // setCartData(fetchedCart.data);
      // updateCartItems=await generateCartItemsFrom(cartData,productsObj);
      
      return fetchedCart.data;
    } catch (e) {
     
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // const itemsFullData = generateCartItemsFrom(cartData,productsObj);
  // let updateCartItems =  generateCartItemsFrom(cartData,productsObj);

 

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    // return items.includes(productId)?true:false;
    if (items) {
      return items.findIndex((item) => item.productId === productId) !== -1;
    }
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    // POST call to update

  
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }
    if (
      options.preventDuplicate &&
      items.find((item) => item._id === productId)
    ) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }
    // if(options.preventDuplicate && isItemInCart){
    //   enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.",{variant:"warning"});
    //   return;
    // }

    try {
      const res = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      

      // const updateCartItems=generateCartItemsFrom(res.data,productsObj);
      // setItemsInCart(updateCartItems);
      setItemsInCart(generateCartItemsFrom(res.data, productsObj));
  
    } catch (error) {
   
      enqueueSnackbar("Error adding to cart.", { variant: "error" });
    }
    // return true;
  };

  useEffect(() => {
    performAPICall();
  }, []);
  useEffect(() => {
    if (!token) return;
    else {
      fetchCart(token)
        .then((cart) => {
         
          return generateCartItemsFrom(cart, productsObj);
        })
        .then((item) => {
         
          setItemsInCart(item);
        })
      
    }
  }, [productsObj]);

  //   const handleItemQuantity=async (token,items,products,itemId,itemQty)=>{
  //     // setItemQuantity(itemQty)
  //    await addToCart(token,items,products,itemId,itemQty,{preventDuplicate:false,})
  //   // .then(()=>{})
  // }

  return (
    <div>
      <Header loggedInUsername={loginCred}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

        {/* Search view for desktops */}
        <TextField
          id="outlined-search"
          className="search-desktop"
          placeholder="Search for items/categories"
          // label="Search for items/categories"
          size="small"
          type="search"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          name="search"
          onChange={(e) => {
            debounceSearch(e, debounceTimeout);
          }}
        />
      </Header>

      {/* Search view for mobiles */}

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, debounceTimeout);
        }}
      />

      {/* start- product grid in loggedin and loggedout view*/}
      {loginCred ? (
        <>
          <Grid container>
            <Grid item xs={12} md={9}>
              <Grid container>
                <Grid item className="product-grid">
                  <Box className="hero">
                    <p className="hero-heading">
                      India’s{" "}
                      <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                      to your door step
                    </p>
                  </Box>
                </Grid>
                {/* </Grid> */}
                <Grid item>
                  {productLoading ? (
                    <>
                      <CircularProgress />
                      <p>Loading Products</p>
                    </>
                  ) : (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {productsObj.map((product) => (
                        <Grid
                          item
                          xs={6}
                          md={3}
                          key={product._id}
                          sx={{ mt: 2 }}
                        >
                          <ProductCard
                            product={product}
                            handleAddToCart={async () => {
                              await addToCart(
                                token,
                                itemsInCart,
                                productsObj,
                                product._id,
                                1,
                                {
                                  preventDuplicate: true,
                                }
                              );
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>

            <Grid item className="cart-background" xs={12} md={3}>
              <Cart
                products={productsObj}
                items={itemsInCart}
                handleQuantity={addToCart}
              />{" "}
              {/* cart grid */}
            </Grid>
          </Grid>
        </>
      ) : (
        // else case
        <>
          <Grid container>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
          </Grid>
          {productLoading ? (
            <>
              <CircularProgress />
              <p>Loading Products</p>
            </>
          ) : (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {productsObj.map((product) => (
                <Grid item xs={6} md={3} key={product._id} sx={{ mt: 2 }}>
                  <ProductCard
                    product={product}
                    handleAddToCart={async () => {
                      await addToCart(
                        token,
                        itemsInCart,
                        productsObj,
                        product._id,
                        1,
                        {
                          preventDuplicate: true,
                        }
                      );
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      {/* end -product grid in loggedin and loggedout view*/}

      {searchNullResult && (
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "50vh" }}
        >
          <Grid item xs={12} lg={12}>
            <Box
              alignItems="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignContent="center"
            >
              <SentimentDissatisfied color="action" />
              <h4>No products found</h4>
            </Box>
          </Grid>
        </Grid>
      )}
      <Footer />
    </div>
  );
};

export default Products;
