import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function ProductListScreen() {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm('Bạn có chắc muốn thêm sản phẩm nó sẽ thêm luôn nếu bạn bấm OK!!!')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('Thêm sản phẩm thành công');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  const deleteHandler = async (product) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Xóa thành công');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };
  const limitText = (text, maxLength) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  }
  return (
    <div className='mx-auto w-full max-w-screen-xl'>
  <Row className="mb-4">
    <Col>
      <h1 className="text-3xl font-bold">Quản Lý Sản Phẩm</h1>
    </Col>
    <Col className="col text-end">
      <div>
        <Button type="button" onClick={createHandler} className="bg-green-500 text-white border-none px-4 py-2 rounded">
          Thêm Sản Phẩm
        </Button>
      </div>
    </Col>
  </Row>

  {loadingCreate && <LoadingBox></LoadingBox>}
  {loadingDelete && <LoadingBox></LoadingBox>}

  {loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <>
      <table className="table w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2">ID</th>
            <th className="py-2">TÊN</th>
            <th className="py-2">GIÁ</th>
            <th className="py-2">ẢNH</th>
            <th className="py-2">MÔ TẢ</th>
            <th className="py-2">DANH MỤC</th>
            <th className="py-2">TÁC GIẢ</th>
            <th className="py-2">THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b hover:bg-gray-100">
              <td className="py-3">{product._id}</td>
              <td className="py-3 overflow-hidden max-w-[300px]">{limitText(product.name, 50)}</td>
              <td className="py-3 ">{product.price}</td>
              <td className="py-3 overflow-hidden max-w-[100px]"><img src={product.image}></img></td>

              <td className="py-3 overflow-hidden max-w-[300px]">{limitText(product.description, 50)}</td>
              <td className="py-3">{product.category}</td>
              <td className="py-3">{product.brand}</td>
              <td className="py-3">
                <Button
                  type="button"
                  variant="light"
                  onClick={() => navigate(`/admin/product/${product._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => deleteHandler(product)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        {[...Array(pages).keys()].map((x) => (
          <Link
            className={x + 1 === Number(page) ? 'btn text-bold mx-1 py-2 px-4 bg-blue-500 text-white rounded' : 'btn mx-1 py-2 px-4 bg-gray-300 text-gray-600 rounded'}
            key={x + 1}
            to={`/admin/products?page=${x + 1}`}
          >
            {x + 1}
          </Link>
        ))}
      </div>
    </>
  )}
</div>


  );
}
