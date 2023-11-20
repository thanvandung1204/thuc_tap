import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
        users: action.payload,
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
export default function UserListScreen() {
  const navigate = useNavigate();
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users`, {
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

  const deleteHandler = async (user) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('user deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
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
    <title>Người Dùng</title>
  </Helmet>
  <h1 className='my-4 text-3xl font-bold'>Danh Sách Người Dùng</h1>

  {loadingDelete && <LoadingBox />}
  {loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div className="overflow-x-auto">
      <table className="table table-striped table-hover">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Tên</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Quản trị viên</th>
            <th className="py-2 px-4">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {users.map((user) => (
            <tr key={user._id} className="transition duration-300 hover:bg-gray-100">
              <td className="py-2 px-4">{user._id}</td>
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.isAdmin ? 'CÓ' : 'KHÔNG'}</td>
              <td className="py-2 px-4">
                <Button
                  type="button"
                  variant="light"
                  onClick={() => navigate(`/admin/user/${user._id}`)}
                  className="bg-blue-500 border-none px-2 py-1 rounded text-white transition duration-300"
                >
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => deleteHandler(user)}
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
