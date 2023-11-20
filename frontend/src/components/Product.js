import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";

function Product(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity },
    });
  };

  return (
<Card className="max-w-2xl   mx-auto">

<Link to={`/product/${product.slug}`} classNameName="block">
        <img
          src={product.image}
          classNameName="w-full h-48 object-cover"
          alt={product.name}
        />
      </Link>
	<Card.Body className="bg-white shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700">
	
			<div className="px-5 pb-5">
      <Link to={`/product/${product.slug}`} className="block">
          <Card.Title className="text-gray-900 font-semibold text-xl tracking-tight dark:text-white">
            {product.name}
          </Card.Title>
        </Link>
				
				
				<div className="flex items-center justify-between">
       
        <Card.Text className="py-2 text-xl font-bold text-gray-700">
          {product.price}
          <span className="text-[14px]">₫</span>
        </Card.Text>
        {product.countInStock === 0 ? (
          <Button
            variant="light"
            disabled
            className="bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Hết hàng
          </Button>
        ) : (
          <Button
            onClick={() => addToCartHandler(product)}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg ml-4 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Thêm vào giỏ hàng
          </Button>
        )}
					
				</div>
			</div>
	</Card.Body>
</Card>
    
  );
}
export default Product;
