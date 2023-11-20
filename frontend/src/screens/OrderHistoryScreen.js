import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Button from 'react-bootstrap/esm/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `/api/orders/mine`,

          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo]);
  return (
    <div className='mx-auto w-full max-w-screen-xl'>
      <Helmet>
        <title>Đơn hàng</title>
      </Helmet>

      <h1 className='text-3xl font-bold my-3'>Đơn hàng</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 border-b">ID</th>
          <th className="py-2 px-4 border-b">Ngày</th>
          <th className="py-2 px-4 border-b">Tổng tiền</th>
          <th className="py-2 px-4 border-b">Thanh toán</th>
          <th className="py-2 px-4 border-b">Giao hàng</th>
          <th className="py-2 px-4 border-b">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order._id} className="hover:bg-gray-50 transition duration-300">
            <td className="py-2 px-4 border-b">{order._id}</td>
            <td className="py-2 px-4 border-b">{order.createdAt.substring(0, 10)}</td>
            <td className="py-2 px-4 border-b">{order.totalPrice.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">{order.isPaid ? order.paidAt.substring(0, 10) : 'Chưa'}</td>
            <td className="py-2 px-4 border-b">
              {order.isDelivered
                ? order.deliveredAt.substring(0, 10)
                : 'Chưa'}
            </td>
            <td className="py-2 px-4 border-b">
              <Button
                className='bg-blue-500 text-white'
                type="button"
                variant="light"
                onClick={() => {
                  navigate(`/order/${order._id}`);
                }}
              >
                Chi tiết
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
      )}
    </div>
  );
}
