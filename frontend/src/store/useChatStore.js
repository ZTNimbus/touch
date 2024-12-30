import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

const useChatStore = create((set, get) => {
  return {
    messages: [],
    users: [],
    selectedUser: null,

    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");

        set({ users: res.data });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isUsersLoading: false });
      }
    },

    getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);

        set({ messages: res.data });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isMessagesLoading: false });
      }
    },

    sendMessage: async (data) => {
      const { messages, selectedUser } = get();

      try {
        const res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          data
        );

        set({ messages: [...messages, res.data] });
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },

    subscribeToMessages: () => {
      const { selectedUser } = get();

      if (!selectedUser) return;

      const socket = useAuthStore.getState().socket;

      socket.on("newMessage", (newMessage) => {
        if (newMessage.senderId !== selectedUser.id) return;

        set({ messages: [...get().messages, newMessage] });
      });
    },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;

      socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
  };
});

export default useChatStore;