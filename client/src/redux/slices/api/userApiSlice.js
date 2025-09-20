import { USERS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query: (data) => ({
        url: `/api/profile/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    getTeamLists: builder.query({
      query: ({ search }) => ({
        url: `/api/get-team/?search=${search}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getUserTaskStatus: builder.query({
      query: () => ({
        url: `/api/get-status/`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getNotifications: builder.query({
      query: () => ({
        url: `/api/notices/`,
        method: "GET",
        credentials: "include",
      }),
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/${id}/`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    userAction: builder.mutation({
      query: (data) => ({
        url: `/api/${data?.id}/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    markNotiAsRead: builder.mutation({
      query: (data) => ({
        url: `/api/read-noti/?isReadType=${data.type}&id=${data?.id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `/api/change-password/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
    
    toggleUserStatus: builder.mutation({
      query: (data) => ({
        url: `/api/${data.id}/`,
        method: "PUT",
        body: { isActive: data.isActive },
        credentials: "include",
      }),
    }),
  }),
});



export const {
  useUpdateUserMutation,
  useGetTeamListsQuery,
  useDeleteUserMutation,
  useUserActionMutation,
  useChangePasswordMutation,
  useGetNotificationsQuery,
  useMarkNotiAsReadMutation,
  useGetUserTaskStatusQuery,
  useToggleUserStatusMutation,
} = userApiSlice;
