import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

const useAuthStore = create((set, get) => {
  return {
    authUser: null,
    socket: null,
    onlineusers: [],

    //loading states
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    checkAuth: async () => {
      try {
        const res = await axiosInstance.get("/auth/check");

        set({ authUser: res.data });

        get().connectSocket();
      } catch (error) {
        console.log("Error in checkAuth", error);

        set({ autUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    signup: async (data) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);

        set({ authUser: await res.data });

        toast.success("Successfully created account!");

        get().connectSocket();
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isSigningUp: false });
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post("/auth/logout");

        set({ authUser: null });

        toast.success("Successfully logged out");

        get().disconnectSocket();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },

    login: async (data) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);

        set({ authUser: await res.data });

        toast.success(`Welcome back, ${res.data.fullName}!`);

        get().connectSocket();
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isLoggingIn: false });
      }
    },

    updateProfile: async (data) => {
      set({ isUpdatingProfile: true });

      try {
        const res = await axiosInstance.put("/auth/update-profile", data);

        set({ authUser: res.data });

        toast.success("Successfully changed profile picture");
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isUpdatingProfile: false });
      }
    },

    connectSocket: () => {
      const { authUser } = get();
      if (!authUser || get().socket?.connected) return;

      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
      });

      socket.connect();

      set({ socket: socket });

      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    },

    disconnectSocket: () => {
      if (get().socket?.connected) get().socket.disconnect();
    },
  };
});

export default useAuthStore;
