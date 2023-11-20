import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
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

  return (
    <div className="container mx-auto max-w-screen-xl">
  <Helmet>
    <title>Danh Sách Đơn Hàng</title>
  </Helmet>
  <h1 className="my-4 text-3xl font-bold">Danh Sách Đơn Hàng</h1>
  {loadingDelete && <LoadingBox />}
  {loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div className="overflow-x-auto">
      <table className="table-auto w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Người Dùng</th>
            <th className="py-2 px-4">Ngày Tạo</th>
            <th className="py-2 px-4">Tổng Giá Trị</th>
            <th className="py-2 px-4">Đã Thanh Toán</th>
            <th className="py-2 px-4">Đã Giao Hàng</th>
            <th className="py-2 px-4">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {orders.map((order) => (
            <tr key={order._id} className="transition duration-300 hover:bg-gray-100">
              <td className="py-2 px-4">{order._id}</td>
              <td className="py-2 px-4">{order.user ? order.user.name : 'Người Dùng Bị Xóa'}</td>
              <td className="py-2 px-4">{order.createdAt.substring(0, 10)}</td>
              <td className="py-2 px-4">${order.totalPrice.toFixed(2)}</td>
              <td className="py-2 px-4">{order.isPaid ? order.paidAt.substring(0, 10) : 'Không'}</td>
              <td className="py-2 px-4">
                {order.isDelivered
                  ? order.deliveredAt.substring(0, 10)
                  : 'Chưa'}
              </td>
              <td className="py-2 px-4">
                <Button
                  type="button"
                  variant="success"
                  onClick={() => {
                    navigate(`/order/${order._id}`);
                  }}
                  className="bg-blue-500 border-none px-2 py-1 rounded text-white transition duration-300"
                >
                  Chi Tiết
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => deleteHandler(order)}
                  className="px-2 py-1 border-none bg-red-500 rounded text-white ml-2 transition duration-300"
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>



  );
}
