import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/authService'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
}

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authAPI.login(credentials)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        // Store token in localStorage
        localStorage.setItem('token', token)
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        })
        
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authAPI.register(userData)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        // Store token in localStorage
        localStorage.setItem('token', token)
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        })
        
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    })
  }

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const response = await authAPI.getProfile()
          
          if (response.data.success) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.data.data.user,
                token
              }
            })
          } else {
            // Invalid token, remove it
            localStorage.removeItem('token')
            dispatch({ type: AUTH_ACTIONS.LOGOUT })
          }
        } catch (error) {
          // Invalid token, remove it
          localStorage.removeItem('token')
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    checkAuth()
  }, [])

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
