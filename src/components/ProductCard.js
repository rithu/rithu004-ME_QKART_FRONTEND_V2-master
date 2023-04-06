import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  CardActionArea
} from "@mui/material";
import React from "react";
import "./ProductCard.css";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ProductCard = ({ product, handleAddToCart }) => {
 
  return (
    <Card className="card">
      <CardActionArea>
        <CardMedia
          component="img"
          // height="140"
          image={product.image}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="h5">
            ${product.cost}
          </Typography>
          <Rating name="read-only" value={product.rating} readOnly />
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button fullWidth={true} variant="contained" onClick ={()=>{handleAddToCart()}}>
        <AddShoppingCartIcon /> ADD TO CART
        </Button>
      </CardActions>
      
    </Card>
  );
};

export default ProductCard;
