import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setUser, clearCredentials } from '../store/authSlice.js';

const useAuth = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const signIn = (payload) => dispatch(setCredentials(payload));
  const updateUser = (payload) => dispatch(setUser(payload));
  const signOut = () => dispatch(clearCredentials());

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    role: user?.role || null,
    signIn,
    updateUser,
    signOut,
  };
};

export default useAuth;
